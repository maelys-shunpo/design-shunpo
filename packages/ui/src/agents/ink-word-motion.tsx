"use client";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect } from "react";

import { enterUnseen, inWindow } from "../motion/enter-unseen.ts";
import { duration, ease, stagger } from "../motion/tokens.ts";

gsap.registerPlugin(SplitText);

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* The headline plays once a third of the way up from the window's foot, so the reader sees it whole. */
const WELL_INSIDE: IntersectionObserverInit = { rootMargin: "0px 0px -33% 0px" };
/* The sequence, in seconds: the lines rise, then once the last has landed the ink writes the word, and the brackets
   are traced from their top leg down to their foot as it reaches the end. */
const INK_START = 0.8;
const INK_FOR = 0.94;
const BRACKETS_AFTER_INK = 0.64;
const BRACKETS_FOR = 0.52;
/* A headline already in view keeps its lines as read: only the word is written again, after a short breath. */
const REWRITE_START = 0.2;

type EffectCleanup = (() => void) | undefined;

interface Entrance {
  /* What the window watches: the headline, which splitting keeps (the word's own node may be rebuilt). */
  target: HTMLElement;
  build: () => gsap.core.Animation;
  revert: () => void;
}

/* Adds to `timeline`, from `start`: the ink writes the word from its first letter to its last, and the brackets are
   traced from their top leg down to their foot as it reaches the end. */
function writeWord(
  timeline: gsap.core.Timeline,
  word: HTMLElement,
  start: number,
): gsap.core.Timeline {
  word.toggleAttribute("data-writing", true);
  return timeline
    .eventCallback("onComplete", () => {
      word.toggleAttribute("data-writing", false);
    })
    .fromTo(
      word,
      { "--ink-sweep": 1 },
      { "--ink-sweep": 0, duration: INK_FOR, ease: "power2.inOut" },
      start,
    )
    .fromTo(
      word.querySelectorAll("[data-ink-bracket]"),
      { clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: BRACKETS_FOR,
        ease: ease.inOut,
        clearProps: "clipPath",
      },
      start + BRACKETS_AFTER_INK,
    );
}

/* Splits the headline into masked lines, then finds the word again: splitting rebuilds the headline's nodes. */
function writeEntrance(root: HTMLElement): Entrance | undefined {
  const headline = root.closest<HTMLElement>("[data-slot=headline]") ?? root.parentElement;
  if (headline === null) {
    return undefined;
  }
  /* Whitespace kept as written: collapsing it would turn the narrow no-break space before « : » into a breaking one. */
  const split = SplitText.create(headline, {
    type: "lines",
    mask: "lines",
    reduceWhiteSpace: false,
  });
  for (const line of split.lines) {
    if (line instanceof HTMLElement) {
      line.dataset["inkLine"] = "";
    }
  }
  const word = headline.querySelector<HTMLElement>("[data-slot=ink-word]") ?? root;
  return {
    target: headline,
    build: () => {
      const lines = gsap
        .timeline()
        .from(split.lines, {
          yPercent: 105,
          duration: duration.slow,
          ease: ease.emphasized,
          stagger: stagger.base,
        })
        .set(split.masks, { overflow: "visible" });
      return writeWord(lines, word, INK_START);
    },
    revert: () => {
      split.revert();
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
      /* The one exception to `enterUnseen`: a headline already in view keeps its lines as read, but its word is
         written again, since the word is the point of the headline. */
      if (inWindow(target)) {
        const rewrite = writeWord(gsap.timeline(), target, REWRITE_START);
        stop = () => {
          rewrite.progress(1).kill();
        };
        return;
      }
      const entrance = writeEntrance(target);
      if (entrance === undefined) {
        return;
      }
      revert = entrance.revert;
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
