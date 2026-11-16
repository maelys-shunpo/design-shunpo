/* The studio's progress runs across the whole journey, at the pace of the scroll: the camera's shot list and the
   folds are keyed to it inside the scene. */
export function journeyChoreography(progress: { value: number }) {
  return (timeline: gsap.core.Timeline): void => {
    timeline.to(progress, { value: 1, ease: "none", duration: 1 }, 0);
  };
}
