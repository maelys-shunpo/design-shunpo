"use client";

import { useEffect } from "react";

import { enterUnseen, inWindow } from "../motion/enter-unseen.ts";
import { buildWheels } from "./figure-wheels.ts";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* The figure rolls once a third of the way up from the window's foot, like the titles. */
const WELL_INSIDE: IntersectionObserverInit = { rootMargin: "0px 0px -33% 0px" };
/* On the curved wall, the voice under which a print is turned away and its roll rewinds. */
const TURNED_AWAY = 0.5;

type EffectCleanup = (() => void) | undefined;

function voiceOf(card: HTMLElement): number {
  return Number(card.style.getPropertyValue("--ring-voice") || Number.NaN);
}

/* On the curved wall, the card's `--ring-voice` drives the roll: turned away rewinds it, coming to the front replays
   it from the top. Returns the watcher's cleanup. */
function followVoice(card: HTMLElement, timeline: gsap.core.Timeline): () => void {
  if (voiceOf(card) >= 1) {
    /* The wall rests on this print at load: its figure stays as painted, stopped on its value. */
    timeline.progress(1).pause();
  }
  const watcher = new MutationObserver(() => {
    const voice = voiceOf(card);
    if (voice < TURNED_AWAY) {
      timeline.pause(0);
      return;
    }
    if (voice >= 1 && timeline.paused()) {
      timeline.play(0);
    }
  });
  watcher.observe(card, { attributes: true, attributeFilter: ["style"] });
  return () => {
    watcher.disconnect();
  };
}

/* Built once idle: the face's digits become wheels, rolled by the scroll (`enterUnseen`) or, on the curved wall, by
   the card's voice. A face with no digit, or already in view with no voice, stays as painted. */
export function RollingFigureMotion({ face }: { face: HTMLElement | null }): null {
  useEffect((): EffectCleanup => {
    if (face === null || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    if (!/\d/u.test(face.textContent ?? "")) {
      return undefined;
    }
    const card = face.closest<HTMLElement>("[data-slot=case-card]");
    const voiced = card !== null && !Number.isNaN(voiceOf(card));
    if (!voiced && inWindow(face)) {
      return undefined;
    }
    const { timeline, revert } = buildWheels(face);
    const stop =
      voiced && card !== null
        ? followVoice(card, timeline)
        : enterUnseen(face, () => timeline, WELL_INSIDE);
    return () => {
      stop?.();
      revert();
    };
  }, [face]);
  return null;
}
