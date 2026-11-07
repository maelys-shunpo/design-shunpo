"use client";

import { PhaseThread } from "@repo/ui/agents/phase-thread";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { useCallback, useState } from "react";

import { agentsMethod, agentsMethodBackdrop } from "./method-steps";

/* The phase on screen and how many of its deliverables are ticked, at a point of the walk (0 to 1). Each phase owns a
   third; its deliverables tick through the first three quarters of it, then it holds complete. */
function stepAt(progress: number) {
  const scaled = Math.min(progress * agentsMethod.length, agentsMethod.length - 0.0001);
  const phase = Math.floor(scaled);
  const deliverables = agentsMethod[phase]?.details?.length ?? 0;
  return {
    phase,
    checked: Math.min(deliverables, Math.floor((scaled - phase) * (deliverables + 1))),
  };
}

/* Piste A. Held on screen from tablets up: the scroll walks the phases down the thread and ticks what each delivers.
   A phase picked by the visitor opens complete; on phones the thread is the only way through. */
export function MethodThread() {
  const [step, setStep] = useState({ phase: 0, checked: 0 });
  const walk = useCallback((timeline: gsap.core.Timeline) => {
    const progress = { value: 0 };
    timeline.to(progress, {
      value: 1,
      ease: "none",
      duration: 1,
      onUpdate: () => {
        const next = stepAt(progress.value);
        setStep((current) =>
          current.phase === next.phase && current.checked === next.checked ? current : next,
        );
      },
    });
  }, []);
  return (
    <ScrollScene choreography={walk} length="long" minWidth="md">
      <PhaseThread
        label="Les trois phases d’un projet"
        items={agentsMethod}
        backdrop={agentsMethodBackdrop}
        active={step.phase}
        checked={step.checked}
        onSelect={(phase) => {
          setStep({ phase, checked: agentsMethod[phase]?.details?.length ?? 0 });
        }}
      />
    </ScrollScene>
  );
}
