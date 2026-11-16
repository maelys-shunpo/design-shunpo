import { stagger } from "@repo/ui/motion/tokens";

import { purchases } from "./copy";

/* Each correction in turn: the stroke crosses the term, the term fades back, the right words rise into place.
   Authored in the final state; the timeline plays from the uncorrected proof. */
const SHIFT = "power4.inOut";

function inLine(index: number, item: string): string {
  return `[data-slot=struck-line]:nth-child(${index + 1}) [data-scene-item=${item}]`;
}

export function purchaseChoreography(timeline: gsap.core.Timeline): void {
  purchases.forEach((_, index) => {
    const at = index * (1 + stagger.loose);
    timeline
      .from(inLine(index, "strike"), { scaleX: 0, duration: 0.5, ease: SHIFT }, at)
      .from(inLine(index, "sold"), { opacity: 1, duration: 0.5, ease: SHIFT }, at)
      .to(inLine(index, "sold"), { opacity: 0.45, duration: 0.3, ease: SHIFT }, at + 0.3)
      .from(inLine(index, "bought"), { yPercent: 110, duration: 0.6, ease: SHIFT }, at + 0.35);
  });
  timeline.to({}, { duration: 0.6 });
}
