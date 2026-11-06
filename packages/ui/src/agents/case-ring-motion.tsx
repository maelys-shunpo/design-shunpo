"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const WIDE_WITH_MOTION = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";
/* Degrees between two cards on the curve, and how far the wall turns while it crosses the window. */
const STEP_DEGREES = 14;
const TURN_DEGREES = 24;
const DEPTH = 0.9;
const PERSPECTIVE = 1800;

type EffectCleanup = (() => void) | undefined;

function bend(cards: HTMLElement[], turn: number): void {
  const middle = (cards.length - 1) / 2;
  for (const [index, card] of cards.entries()) {
    const angle = (index - middle) * STEP_DEGREES + turn;
    const radians = (angle * Math.PI) / 180;
    const width = card.offsetWidth;
    gsap.set(card, {
      rotateY: -angle,
      z: (1 - Math.cos(radians)) * width * DEPTH * 4,
      transformOrigin: "50% 50%",
    });
  }
}

/* Cards stand on the inside of a cylinder (each turned toward the visitor), and the cylinder turns with the scroll. */
export function CaseRingMotion({ ring }: { ring: HTMLElement | null }): null {
  useEffect((): EffectCleanup => {
    if (ring === null) {
      return undefined;
    }
    const cards = [...ring.querySelectorAll<HTMLElement>("[data-ring-card]")];
    const media = gsap.matchMedia();
    media.add(WIDE_WITH_MOTION, () => {
      const state = { turn: TURN_DEGREES / 2 };
      gsap.set(ring.parentElement, { perspective: PERSPECTIVE });
      bend(cards, state.turn);
      gsap.to(state, {
        turn: -TURN_DEGREES / 2,
        ease: "none",
        scrollTrigger: { trigger: ring, start: "top bottom", end: "bottom top", scrub: true },
        onUpdate: () => {
          bend(cards, state.turn);
        },
      });
      return () => {
        gsap.set(cards, { clearProps: "transform" });
        gsap.set(ring.parentElement, { clearProps: "perspective" });
      };
    });
    return () => {
      media.revert();
    };
  }, [ring]);
  return null;
}
