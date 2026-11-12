"use client";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect } from "react";

import { registerCustomEases } from "../motion/custom-eases.ts";
import { enterUnseen, inWindow } from "../motion/enter-unseen.ts";
import { ease } from "../motion/tokens.ts";
import { linesEntrance } from "./headline-entrances.ts";

gsap.registerPlugin(SplitText);
registerCustomEases();

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* The headline plays once a third of the way up from the window's foot, so the reader sees it whole. */
const WELL_INSIDE: IntersectionObserverInit = { rootMargin: "0px 0px -33% 0px" };
/* The sequence, in seconds: the lines rise; once « commence par une » has landed the word comes into focus letter by
   letter, and the brackets close on it from outside as the focus pull ends. */
const FOCUS_AT = 0.75;
const FOCUS_FOR = 0.8;
const FOCUS_STAGGER = 0.045;
const BRACKETS_AT = 1.3;
const BRACKETS_FOR = 0.55;
/* How far outside the word each bracket starts, in em. */
const BRACKETS_FROM = 0.35;

type EffectCleanup = (() => void) | undefined;

interface FocusEntrance {
  /* What the window watches: the headline, which splitting keeps (the word's own node may be rebuilt). */
  target: HTMLElement;
  build: () => gsap.core.Timeline;
  revert: () => void;
}

/* Splits the headline into lines, then finds the word again (splitting rebuilds the headline's nodes) and splits it
   into letters. The letters and brackets start hidden the moment the entrance exists, so the word's place is reserved
   and nothing flashes before the timeline's from states take over. */
function focusEntrance(root: HTMLElement): FocusEntrance | undefined {
  const headline = root.closest<HTMLElement>("[data-slot=headline]") ?? root.parentElement;
  if (headline === null) {
    return undefined;
  }
  const lines = linesEntrance(headline);
  const word = headline.querySelector<HTMLElement>("[data-slot=ink-word]") ?? root;
  /* The lines split may clone the word's text span across a boundary and leave an empty clone: split every span that
     still carries text. */
  const texts = [...word.querySelectorAll<HTMLElement>("[data-ink-text]")].filter(
    (span) => (span.textContent ?? "") !== "",
  );
  const letters = SplitText.create(texts.length > 0 ? texts : word, {
    type: "chars",
    reduceWhiteSpace: false,
  });
  for (const letter of letters.chars) {
    if (letter instanceof HTMLElement) {
      letter.dataset["focusLetter"] = "";
    }
  }
  const [start, end] = [...word.querySelectorAll<HTMLElement>("[data-ink-bracket]")];
  const brackets = [start, end].filter((bracket) => bracket !== undefined);
  const reach = Number(getComputedStyle(word).fontSize.replace("px", "")) * BRACKETS_FROM;
  gsap.set(letters.chars, { opacity: 0 });
  gsap.set(brackets, { opacity: 0 });
  return {
    target: headline,
    build: () => {
      const timeline = lines.build().fromTo(
        letters.chars,
        { opacity: 0, filter: "blur(14px)", scale: 1.08 },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: FOCUS_FOR,
          ease: ease.emphasized,
          stagger: FOCUS_STAGGER,
          force3D: false,
          clearProps: "filter",
        },
        FOCUS_AT,
      );
      brackets.forEach((bracket, side) => {
        timeline.fromTo(
          bracket,
          { x: side === 0 ? -reach : reach, opacity: 0 },
          { x: 0, opacity: 1, duration: BRACKETS_FOR, ease: ease.fluid, force3D: false },
          BRACKETS_AT,
        );
      });
      return timeline;
    },
    revert: () => {
      lines.revert();
      letters.revert();
    },
  };
}

/* Built once the faces are loaded, so the headline's lines break where the visitor sees them break. */
export function InkWordMotion({ root }: { root: HTMLElement | null }): null {
  useEffect((): EffectCleanup => {
    if (root === null || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    let stop: (() => void) | undefined;
    let revert: (() => void) | undefined;
    let mounted = true;
    async function prepare(target: HTMLElement): Promise<void> {
      await document.fonts.ready;
      if (!mounted) {
        return;
      }
      const entrance = focusEntrance(target);
      if (entrance === undefined) {
        return;
      }
      revert = entrance.revert;
      /* The one exception to `enterUnseen`: this headline replays whole even when already in view, since the word
         coming into focus is the point of the headline. */
      if (inWindow(entrance.target)) {
        const replay = entrance.build();
        stop = () => {
          replay.kill();
        };
        return;
      }
      stop = enterUnseen(entrance.target, entrance.build, WELL_INSIDE);
    }
    void prepare(root);
    return () => {
      mounted = false;
      stop?.();
      revert?.();
    };
  }, [root]);
  return null;
}
