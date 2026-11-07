"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

import { ease, scrub } from "./tokens.ts";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ALLOW_MOTION = "(prefers-reduced-motion: no-preference)";

const breakpointQuery = {
  all: ALLOW_MOTION,
  md: `(min-width: 48rem) and ${ALLOW_MOTION}`,
} as const;

export type SceneBreakpoint = keyof typeof breakpointQuery;

/* smoothed: the timeline catches up with the scroll over the scrub token, the one smoothing layer of a scene.
   direct: the timeline follows the scroll position exactly, for a world that already smooths itself (a spring). */
const scrubbing = {
  smoothed: scrub,
  direct: true,
} as const;

export type SceneScrub = keyof typeof scrubbing;

/* Scrolls the page to a point of the scene, from 0 (held) to 1 (released). */
export type SceneSeek = (progress: number) => void;

interface ScrollSceneTimelineProps {
  track: RefObject<HTMLDivElement | null>;
  choreography: (timeline: gsap.core.Timeline) => void;
  minWidth: SceneBreakpoint;
  scrub: SceneScrub;
  onSeek?: ((seek: SceneSeek | null) => void) | undefined;
}

/* One timeline scrubbed across the track, from the breakpoint up and only when motion is allowed. */
export function ScrollSceneTimeline({
  track,
  choreography,
  minWidth,
  scrub: scrubbingMode,
  onSeek,
}: ScrollSceneTimelineProps): null {
  useGSAP(
    () => {
      gsap.matchMedia().add(breakpointQuery[minWidth], () => {
        const timeline = gsap.timeline({
          defaults: { ease: ease.standard },
          scrollTrigger: {
            trigger: track.current,
            start: "top top",
            end: "bottom bottom",
            scrub: scrubbing[scrubbingMode],
          },
        });
        choreography(timeline);
        onSeek?.((progress: number) => {
          const trigger = timeline.scrollTrigger;
          if (trigger === undefined) {
            return;
          }
          window.scrollTo({
            top: trigger.start + (trigger.end - trigger.start) * progress,
            behavior: "smooth",
          });
        });
        return () => {
          onSeek?.(null);
        };
      });
    },
    { scope: track },
  );

  return null;
}
