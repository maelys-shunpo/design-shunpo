/* The coupe's timeline, one unit long: the scene's progress runs through it at the scroll's pace. Everything the
   coupe shows is posed from that one value, so the timeline drives nothing else; the title and the call are uncovered
   by the halves falling away, not by a tween of their own. */
export function coupeChoreography(progress: { value: number }) {
  return function choreography(timeline: gsap.core.Timeline): void {
    timeline.to(progress, { value: 1, ease: "none", duration: 1 }, 0);
  };
}
