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

/* The track holds the items twice: moving it by half its length and looping shows no seam. It holds while the wall
   is under the pointer or holds focus (WCAG 2.2.2), and off screen. */
export function MarqueeMotion({ track, direction, lap }: MarqueeMotionProps): null {
  useEffect((): EffectCleanup => {
    if (track === null || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    const tween = gsap.to(track, { ...travel[direction], duration: lap, ease: "none", repeat: -1 });
    /* The wall the column belongs to: the pointer over any column, or focus inside it, holds them all. */
    const wall = track.closest("[data-slot=tool-columns]") ?? track.parentElement ?? track;
    const held = { seen: false, pointer: false, focus: false };
    function update() {
      tween.paused(!held.seen || held.pointer || held.focus);
    }
    const observer = new IntersectionObserver((entries) => {
      held.seen = entries.some((entry) => entry.isIntersecting);
      update();
    });
    observer.observe(track);
    const listening = new AbortController();
    function hold(key: "pointer" | "focus", value: boolean) {
      return () => {
        held[key] = value;
        update();
      };
    }
    wall.addEventListener("pointerenter", hold("pointer", true), { signal: listening.signal });
    wall.addEventListener("pointerleave", hold("pointer", false), { signal: listening.signal });
    wall.addEventListener("focusin", hold("focus", true), { signal: listening.signal });
    wall.addEventListener("focusout", hold("focus", false), { signal: listening.signal });
    return () => {
      observer.disconnect();
      listening.abort();
      tween.kill();
      gsap.set(track, { clearProps: "transform" });
    };
  }, [track, direction, lap]);
  return null;
}
