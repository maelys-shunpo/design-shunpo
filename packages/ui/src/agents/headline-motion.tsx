"use client";

import { useEffect } from "react";

import { registerCustomEases } from "../motion/custom-eases.ts";
import { enterUnseen, inWindow } from "../motion/enter-unseen.ts";
import type { HeadlineEntranceKind } from "./headline-entrance.tsx";
import { type Entrance, linesEntrance } from "./headline-entrances.ts";

registerCustomEases();

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* The headline plays once a third of the way up from the window's foot, so the reader sees it whole. */
const WELL_INSIDE: IntersectionObserverInit = { rootMargin: "0px 0px -33% 0px" };

/* One builder per entrance kind; `letters` and `throw` take their own builders in later tasks. */
const ENTRANCES: Record<HeadlineEntranceKind, (headline: HTMLElement) => Entrance> = {
  lines: linesEntrance,
  letters: linesEntrance,
  throw: linesEntrance,
};

type EffectCleanup = (() => void) | undefined;

interface HeadlineMotionProps {
  /* The hidden anchor rendered right after the headline. */
  anchor: HTMLElement | null;
  kind: HeadlineEntranceKind;
}

/* Built once the faces are loaded, so the headline's lines break where the visitor sees them break. A headline already
   in view stays as painted: it is never split. */
export function HeadlineMotion({ anchor, kind }: HeadlineMotionProps): null {
  useEffect((): EffectCleanup => {
    const headline = anchor?.previousElementSibling;
    if (!(headline instanceof HTMLElement) || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    let stop: (() => void) | undefined;
    let revert: (() => void) | undefined;
    let mounted = true;
    async function prepare(target: HTMLElement): Promise<void> {
      await document.fonts.ready;
      if (!mounted || inWindow(target)) {
        return;
      }
      const entrance = ENTRANCES[kind](target);
      revert = entrance.revert;
      stop = enterUnseen(target, entrance.build, WELL_INSIDE);
    }
    void prepare(headline);
    return () => {
      mounted = false;
      stop?.();
      revert?.();
    };
  }, [anchor, kind]);
  return null;
}
