"use client";

import { AgentTabs } from "@repo/ui/agents/agent-tabs";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { useCallback, useState } from "react";

import { agentsMethod, agentsMethodBackdrop } from "./method-steps";

/* Held on screen from tablets up: the scroll fills the bar under the phases and walks them, one third each. The tabs stay
   clickable, and on phones they are the only way through. */
export function MethodProgress() {
  const [phase, setPhase] = useState(0);
  const walk = useCallback((timeline: gsap.core.Timeline) => {
    const progress = { value: 0 };
    timeline.fromTo(
      "[data-phase-rail]",
      { scaleX: 0 },
      { scaleX: 1, ease: "none", duration: 1 },
      0,
    );
    timeline.to(
      progress,
      {
        value: 1,
        ease: "none",
        duration: 1,
        onUpdate: () => {
          setPhase(
            Math.min(agentsMethod.length - 1, Math.floor(progress.value * agentsMethod.length)),
          );
        },
      },
      0,
    );
  }, []);
  return (
    <ScrollScene choreography={walk} length="long" minWidth="md">
      <AgentTabs
        label="Les trois phases d’un projet"
        items={agentsMethod}
        layout="below"
        backdrop={agentsMethodBackdrop}
        active={phase}
        rail
      />
    </ScrollScene>
  );
}
