import { ease } from "@repo/ui/motion/tokens";

import { operations } from "./operations";

/* The hero's timeline in units of its own: the calibre's progress runs across all of it, and each operation
   row lights while its phase plays (assembly, running, dial). The first window is painted with every row lit:
   the choreography only dims the others as the scroll begins (timeline.to, never from). */
const LENGTH = 10;
const DIMMED = 0.28;
const LIGHT = 0.6;
const PHASES = [1, 5.2, 7.6] as const;
const RISE = 1.4;

function row(index: number): string {
  return `[data-scene-item='operation-${index}']`;
}

/* On a phone the hero is taller than the window: its frame rises until the calibre sits in view. On a desktop
   it fits, and the rise is zero. */
function overflow(_index: number, frame: Element): number {
  return Math.min(0, window.innerHeight - frame.getBoundingClientRect().height);
}

export function heroChoreography(progress: { value: number }) {
  return (timeline: gsap.core.Timeline): void => {
    timeline.to(progress, { value: 1, ease: "none", duration: LENGTH }, 0);
    timeline.to(
      "[data-scene-item='hero-frame']",
      { y: overflow, duration: RISE, ease: ease.inOut },
      0,
    );
    PHASES.forEach((at, active) => {
      operations.forEach((_, index) => {
        timeline.to(
          row(index),
          { opacity: index === active ? 1 : DIMMED, duration: LIGHT, ease: ease.inOut },
          at,
        );
      });
    });
    timeline.to(
      "[data-scene-item='hero-copy']",
      { opacity: 0.5, duration: LIGHT * 2, ease: ease.inOut },
      PHASES[0],
    );
  };
}
