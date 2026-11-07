"use client";

import { PhaseStack } from "@repo/ui/agents/phase-stack";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";

import { agentsMethod, agentsMethodBackdrop } from "./method-steps";

function card(position: number) {
  return `[data-stack-card]:nth-child(${String(position)})`;
}

/* Each phase after the first slides up from below the window and settles over the one before, which steps back. */
function deal(timeline: gsap.core.Timeline) {
  const ease = "power2.inOut";
  agentsMethod.slice(1).forEach((_, index) => {
    const position = index + 2;
    const at = 0.4 + index * 1.4;
    timeline.fromTo(card(position), { yPercent: 130 }, { yPercent: 0, duration: 1, ease }, at);
    for (let below = 1; below < position; below += 1) {
      timeline.to(
        card(below),
        { scale: 1 - (position - below) * 0.03, transformOrigin: "50% 0%", duration: 1, ease },
        at,
      );
    }
  });
  timeline.to({}, { duration: 0.4 });
}

/* Piste B. Held on screen from tablets up while the phases are dealt one over the other. On phones and under
   reduced motion the three cards follow one another. */
export function MethodStack() {
  return (
    <ScrollScene choreography={deal} length="long" minWidth="md">
      <PhaseStack
        label="Les trois phases d’un projet"
        items={agentsMethod}
        backdrop={agentsMethodBackdrop}
      />
    </ScrollScene>
  );
}
