"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

import { scrub } from "../motion/tokens.ts";
import { createVideoSeeker, type VideoSources, whenNear } from "../motion/video-seeker.ts";
import { type FilmCues, heroFilmCourse } from "./hero-film-course.ts";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ALLOW_MOTION = "(prefers-reduced-motion: no-preference)";

interface HeroFilmMotionProps {
  stage: RefObject<HTMLDivElement | null>;
  track: RefObject<HTMLDivElement | null>;
  video: RefObject<HTMLVideoElement | null>;
  sources: VideoSources;
  cues: FilmCues;
}

/* The motion renders after the hero has mounted, so its parts are there. */
function mounted<Element>(ref: RefObject<Element | null>): Element {
  if (ref.current === null) {
    throw new Error("The hero film is not mounted.");
  }
  return ref.current;
}

/* The hero film's motion, loaded once the page is idle: the course scrubbed across the hold, from the moment the
   track's top enters the window (the page's top, the stage filling it) to its end; the film downloaded once the
   visitor engages and the stage is near (ADR-0031). The course is built once the faces are loaded, so the promise
   splits into letters on the lines the visitor sees. */
export function HeroFilmMotion({ stage, track, video, sources, cues }: HeroFilmMotionProps): null {
  useGSAP(() => {
    gsap.matchMedia().add(ALLOW_MOTION, () => {
      const film = mounted(video);
      const seeker = createVideoSeeker(film, sources);
      const stopWatching = whenNear(film, seeker.load);
      let timeline: gsap.core.Timeline | undefined;
      let cancelled = false;
      async function build(): Promise<void> {
        await document.fonts.ready;
        if (cancelled) {
          return;
        }
        timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: mounted(track),
            start: "top bottom",
            end: "bottom bottom",
            scrub,
          },
        });
        heroFilmCourse(mounted(stage), cues, seeker.seek)(timeline);
      }
      void build();
      return () => {
        cancelled = true;
        stopWatching();
        seeker.dispose();
        timeline?.kill();
      };
    });
  });

  return null;
}
