"use client";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect } from "react";

import { enterUnseen } from "../motion/enter-unseen.ts";
import { duration, ease, stagger } from "../motion/tokens.ts";
import type { RevealMode } from "./reveal.tsx";

gsap.registerPlugin(SplitText);

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const LINES = "[data-slot=heading]";
const ITEMS =
  "[data-slot=entry], [data-slot=question], [data-slot=reference-row], [data-slot=struck-line], [data-slot=frame-item], [data-slot=method-step]";

type EffectCleanup = (() => void) | undefined;

function lineEntrance(root: Element): { build: () => gsap.core.Animation; revert: () => void } {
  const split = SplitText.create(root.querySelectorAll(LINES), { type: "lines", mask: "lines" });
  return {
    build: () =>
      gsap.from(split.lines, {
        yPercent: 110,
        duration: duration.slow,
        ease: ease.emphasized,
        stagger: stagger.base,
      }),
    revert: () => {
      split.revert();
    },
  };
}

function sweepEntrance(root: Element): gsap.core.Animation {
  return gsap.fromTo(
    root.querySelectorAll(ITEMS),
    { clipPath: "inset(0% 100% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: duration.slow,
      ease: ease.inOut,
      stagger: stagger.loose,
      clearProps: "clipPath",
    },
  );
}

/* Built once the faces are loaded, so lines break where the visitor sees them break. */
export function RevealMotion({ root, mode }: { root: HTMLElement | null; mode: RevealMode }): null {
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
      if (mode === "sweep") {
        stop = enterUnseen(target, () => sweepEntrance(target));
        return;
      }
      const entrance = lineEntrance(target);
      revert = entrance.revert;
      stop = enterUnseen(target, entrance.build);
    }
    void prepare(root);
    return () => {
      mounted = false;
      stop?.();
      revert?.();
    };
  }, [root, mode]);
  return null;
}
