import { duration, ease } from "@repo/ui/motion/tokens";

function item(id: string): string {
  return `[data-scene-item='${id}']`;
}

const steps = ["step-1", "step-2", "step-3"];
const boards = ["board-1", "board-2", "board-3"];
const DIMMED = 0.35;
const RISE = 24;

function focus(timeline: gsap.core.Timeline, index: number, at: string): void {
  steps.forEach((id, other) => {
    timeline.to(item(id), { opacity: other === index ? 1 : DIMMED, duration: duration.base }, at);
  });
}

function swap(timeline: gsap.core.Timeline, from: number, at: string): void {
  timeline
    .to(
      item(boards[from] ?? ""),
      { opacity: 0, y: -RISE, duration: duration.slow, ease: ease.inOut },
      at,
    )
    .fromTo(
      item(boards[from + 1] ?? ""),
      { opacity: 0, y: RISE },
      { opacity: 1, y: 0, duration: duration.slow, ease: ease.inOut },
      at,
    );
}

/* Three boards in one place: the process today, the workflow being built, the team in production. */
export function walkMethod(timeline: gsap.core.Timeline): void {
  timeline.set(`${item("board-2")}, ${item("board-3")}`, { opacity: 0 }, 0).addLabel("audit", 0);
  focus(timeline, 0, "audit");
  timeline.addLabel("build", `>+${duration.slow}`);
  focus(timeline, 1, "build");
  swap(timeline, 0, "build");
  timeline.addLabel("adopt", `>+${duration.slow}`);
  focus(timeline, 2, "adopt");
  swap(timeline, 1, "adopt");
  timeline.to({}, { duration: duration.slow });
}
