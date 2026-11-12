"use client";

import { useEffect } from "react";

import { enterUnseen, inWindow } from "../motion/enter-unseen.ts";
import { buildWheels } from "./figure-wheels.ts";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* The figure rolls once a third of the way up from the window's foot, like the titles. */
const WELL_INSIDE: IntersectionObserverInit = { rootMargin: "0px 0px -33% 0px" };
/* On the references wall the figures stand low on their cards: they roll as soon as they show, the wall having already
   waited to be seen (`data-arrival`). */
const WITHIN_WALL: IntersectionObserverInit = { rootMargin: "0px" };

type EffectCleanup = (() => void) | undefined;

/* Built once idle: the face's digits become wheels, rolled once by the scroll (`enterUnseen`). A face with no digit, or
   already in view, stays as painted. */
export function RollingFigureMotion({ face }: { face: HTMLElement | null }): null {
  useEffect((): EffectCleanup => {
    if (face === null || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    if (!/\d/u.test(face.textContent ?? "") || inWindow(face)) {
      return undefined;
    }
    const { timeline, revert } = buildWheels(face);
    const margin = face.closest("[data-arrival]") === null ? WELL_INSIDE : WITHIN_WALL;
    const stop = enterUnseen(face, () => timeline, margin);
    return () => {
      stop?.();
      revert();
    };
  }, [face]);
  return null;
}
