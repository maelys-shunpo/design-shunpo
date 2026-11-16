"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";

import { enterUnseen } from "../motion/enter-unseen.ts";
import { duration, ease, scrub, stagger } from "../motion/tokens.ts";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin, SplitText);

const ALLOW_MOTION = "(prefers-reduced-motion: no-preference)";
const STACKING = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";
/* A stacked craft card draws back this much as the next one covers it. */
const STACKED_SCALE = 0.94;

function all(root: HTMLElement, selector: string): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(selector)];
}

/* The thread's tip runs a little below the middle of the window, through each band as the band is read. */
function drawThreads(root: HTMLElement): void {
  for (const path of all(root, "[data-fil-thread]")) {
    gsap.fromTo(
      path,
      { drawSVG: "0% 0%" },
      {
        drawSVG: "0% 100%",
        ease: "none",
        scrollTrigger: {
          trigger: path.closest("[data-slot=fil-section]"),
          start: "top 65%",
          end: "bottom 65%",
          scrub,
        },
      },
    );
  }
}

function drawStrokes(root: HTMLElement): Array<(() => void) | undefined> {
  return all(root, "[data-fil-strike], [data-fil-rail]").map((stroke) =>
    enterUnseen(stroke, () =>
      gsap.from(stroke, {
        scaleX: 0,
        duration: stroke.dataset["filRail"] === undefined ? duration.slow : duration.slow * 2,
        ease: ease.inOut,
        delay: duration.fast,
      }),
    ),
  );
}

function drawUnderlines(root: HTMLElement): Array<(() => void) | undefined> {
  return all(root, "[data-fil-underline]").map((underline) =>
    enterUnseen(underline, () =>
      gsap.fromTo(
        underline,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", duration: duration.slow, ease: ease.inOut, delay: duration.base },
      ),
    ),
  );
}

function revealLines(root: HTMLElement): Array<(() => void) | undefined> {
  return all(root, "[data-fil-reveal]").map((headline) =>
    enterUnseen(headline, () => {
      const reveal = gsap.timeline();
      SplitText.create(headline, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        aria: "auto",
        onSplit(split) {
          const lines = gsap.from(split.lines, {
            yPercent: 110,
            duration: duration.slow,
            ease: ease.emphasized,
            stagger: stagger.base,
          });
          reveal.add(lines, 0);
          return lines;
        },
      });
      return reveal;
    }),
  );
}

/* Each craft card draws back under the next one as it slides over it (the cards are siblings). */
function settleCards(root: HTMLElement): void {
  for (const next of all(root, "[data-slot=fil-expertise] + [data-slot=fil-expertise]")) {
    gsap.to(next.previousElementSibling, {
      scale: STACKED_SCALE,
      transformOrigin: "50% 0%",
      ease: "none",
      scrollTrigger: { trigger: next, start: "top bottom", end: "top 30%", scrub },
    });
  }
}

export function FilMotionRuntime({ scope }: { scope: RefObject<HTMLElement | null> }): null {
  useGSAP(
    () => {
      const root = scope.current;
      if (root === null) {
        return;
      }
      const media = gsap.matchMedia();
      media.add(ALLOW_MOTION, () => {
        drawThreads(root);
        const cleanups = [...drawStrokes(root), ...drawUnderlines(root), ...revealLines(root)];
        return () => {
          for (const cleanup of cleanups) {
            cleanup?.();
          }
        };
      });
      media.add(STACKING, () => {
        settleCards(root);
      });
    },
    { scope },
  );
  return null;
}
