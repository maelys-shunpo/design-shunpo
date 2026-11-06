/* Shares of the hold, from 0 to 1, where the stand changes chapter: they follow the shader's combing (0.12 to
   0.44) and braiding (0.56 to 0.88) windows, lit as each gesture is half done. */
const COMBED_AT = 0.3;
const BRAIDED_AT = 0.72;
const CHAPTER_CHANGE = 0.06;
/* The copy leaves the stage in the last stretch, so the hold ends on the cord alone. */
const COPY_LEAVES_AT = 0.86;
const WAITING = 0.7;
const COPY_RISE = -6;
/* With the copy gone, the veils thin out so the finished cord shows whole. */
const VEIL_LIFTED = 0.35;

function name(index: number): string {
  return `[data-fil-beat='${index}']`;
}

function line(index: number): string {
  return `[data-fil-beat-line='${index}']`;
}

function turnChapter(timeline: gsap.core.Timeline, from: number, at: number): void {
  timeline
    .to(name(from), { opacity: WAITING, duration: CHAPTER_CHANGE }, at)
    .to(line(from), { opacity: 0, duration: CHAPTER_CHANGE }, at)
    .to(name(from + 1), { opacity: 1, duration: CHAPTER_CHANGE }, at)
    .to(line(from + 1), { opacity: 1, duration: CHAPTER_CHANGE }, at);
}

/* The hold of the hero: the page's progress runs the threads from tangled to braided, the chapters light in turn
   along the red rail, and the copy steps aside at the end and the veils lift off the cord. Its progress 0 is the painted first window. */
export function braidChoreography(progress: { value: number }) {
  return (timeline: gsap.core.Timeline): void => {
    timeline
      .to(progress, { value: 1, duration: 1, ease: "none" }, 0)
      .to("[data-fil-beats-progress]", { scaleX: 1, duration: 1, ease: "none" }, 0);
    turnChapter(timeline, 0, COMBED_AT);
    turnChapter(timeline, 1, BRAIDED_AT);
    timeline
      .to(
        "[data-fil-hero-copy]",
        { opacity: 0, yPercent: COPY_RISE, duration: 1 - COPY_LEAVES_AT },
        COPY_LEAVES_AT,
      )
      .to(
        "[data-fil-veil]",
        { opacity: VEIL_LIFTED, duration: 1 - COPY_LEAVES_AT },
        COPY_LEAVES_AT,
      );
  };
}
