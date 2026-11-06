"use client";

import { gsap } from "gsap";
import { useEffect } from "react";

import type { MarqueeDirection } from "./marquee.tsx";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type EffectCleanup = (() => void) | undefined;

const travel: Record<MarqueeDirection, gsap.TweenVars> = {
  left: { xPercent: -50 },
  right: { xPercent: 0, startAt: { xPercent: -50 } },
  up: { yPercent: -50 },
  down: { yPercent: 0, startAt: { yPercent: -50 } },
};

interface MarqueeMotionProps {
  track: HTMLElement | null;
  direction: MarqueeDirection;
  lap: number;
}

/* The track holds the items twice: moving it by half its length and looping shows no seam. */
export function MarqueeMotion({ track, direction, lap }: MarqueeMotionProps): null {
  useEffect((): EffectCleanup => {
    if (track === null || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    const tween = gsap.to(track, { ...travel[direction], duration: lap, ease: "none", repeat: -1 });
    const observer = new IntersectionObserver((entries) => {
      tween.paused(!entries.some((entry) => entry.isIntersecting));
    });
    observer.observe(track);
    return () => {
      observer.disconnect();
      tween.kill();
      gsap.set(track, { clearProps: "transform" });
    };
  }, [track, direction, lap]);
  return null;
}
