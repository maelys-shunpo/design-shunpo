import { ease } from "../motion/tokens.ts";

/* The scene's timeline, one unit long: the sign's progress runs through it at the scroll's pace, and the caption
   cuts to its second line as the points lock (two thirds in, the end of the gathering in the scene). The captions
   are looked up in the hero only, never in the rest of the page. */
const LOCK = 0.66;
const CUT = 0.03;

export function shurikenChoreography(progress: { value: number }, scope: HTMLElement | null) {
  return function choreography(timeline: gsap.core.Timeline): void {
    timeline.to(progress, { value: 1, ease: "none", duration: 1 }, 0);
    const before = scope?.querySelector("[data-shuriken-caption='before']");
    const after = scope?.querySelector("[data-shuriken-caption='after']");
    if (before === undefined || before === null || after === undefined || after === null) {
      return;
    }
    timeline
      .to(before, { autoAlpha: 0, yPercent: -60, duration: CUT, ease: ease.inOut }, LOCK)
      .fromTo(
        after,
        { autoAlpha: 0, yPercent: 60 },
        { autoAlpha: 1, yPercent: 0, duration: CUT, ease: ease.inOut },
        LOCK,
      );
  };
}
