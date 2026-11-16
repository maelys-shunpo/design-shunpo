/* The hero scene's timeline, one unit long: the ink's progress runs through it linearly, and each caption swaps
   in the instant the ink jumps (shaders: a particle leaves between 34 % and 56 % of its segment and lands 7 % later).
   The swap is a cut on the shift curve: the old caption leaves upwards, the new one is already there. */

const DRAWINGS = 4;
const SEGMENT = 1 / (DRAWINGS - 1);
/* The middle of the ink's jump within a segment. */
const JUMP = 0.48;
const CUT = 0.025;
const SHIFT = "power4.inOut";

function state(index: number): string {
  return `[data-instant-state='${index}']`;
}

function tick(index: number): string {
  return `[data-instant-tick='${index}']`;
}

export function heroChoreography(progress: { value: number }) {
  return function choreography(timeline: gsap.core.Timeline): void {
    timeline.to(progress, { value: 1, ease: "none", duration: 1 }, 0);
    for (let step = 1; step < DRAWINGS; step += 1) {
      const at = (step - 1 + JUMP) * SEGMENT;
      timeline
        .to(state(step - 1), { autoAlpha: 0, yPercent: -40, duration: CUT, ease: SHIFT }, at)
        .fromTo(
          state(step),
          { autoAlpha: 0, yPercent: 40 },
          { autoAlpha: 1, yPercent: 0, duration: CUT, ease: SHIFT },
          at,
        )
        .to(tick(step - 1), { opacity: 0.2, duration: CUT, ease: SHIFT }, at)
        .to(tick(step), { opacity: 1, duration: CUT, ease: SHIFT }, at);
    }
  };
}
