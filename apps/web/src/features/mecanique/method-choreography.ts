import { ease, stagger } from "@repo/ui/motion/tokens";

import { method } from "../shunpo/content";

/* The method in three operations, measured one after the other: each dimension line is drawn out from its
   label, then its operation is inked in. Content below the first window, so it may enter from an offset. */
const STEP = 1.4;
const DRAW = 0.9;

function within(step: number, item: string): string {
  return `[data-scene-item='step-${step}'] [data-scene-item='${item}']`;
}

export function methodChoreography(timeline: gsap.core.Timeline): void {
  method.forEach((_, step) => {
    const at = step * STEP;
    timeline
      .from(within(step, "dimension-half"), { scaleX: 0, duration: DRAW, ease: ease.inOut }, at)
      .from(
        within(step, "step-body"),
        { opacity: 0.12, y: 24, duration: DRAW, ease: ease.standard, stagger: stagger.base },
        at + DRAW * 0.4,
      );
  });
  timeline.from(
    "[data-scene-item='conviction']",
    { opacity: 0, y: 32, duration: DRAW, ease: ease.standard },
    method.length * STEP,
  );
}
