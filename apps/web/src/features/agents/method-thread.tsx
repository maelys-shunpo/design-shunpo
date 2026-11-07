"use client";

import { PhaseThread } from "@repo/ui/agents/phase-thread";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { useCallback, useRef, useState } from "react";

import { agentsMethod, agentsMethodBackdrop } from "./method-steps";

function deliverablesOf(phase: number) {
  return agentsMethod[phase]?.details?.length ?? 0;
}

/* The phase on screen and how many of its deliverables are ticked, at a point of the walk (0 to 1). Each phase owns a
   third; its deliverables tick through the first three quarters of it, then it holds complete. */
function stepAt(progress: number) {
  const scaled = Math.min(progress * agentsMethod.length, agentsMethod.length - 0.0001);
  const phase = Math.floor(scaled);
  const deliverables = deliverablesOf(phase);
  return {
    phase,
    checked: Math.min(deliverables, Math.floor((scaled - phase) * (deliverables + 1))),
  };
}

/* Where the walk shows a phase complete: past its last tick, before the next phase. */
function completeAt(phase: number) {
  return (phase + 0.85) / agentsMethod.length;
}

/* Held under the header from tablets up: the scroll walks the phases down the thread and ticks what each delivers, and
   a phase picked there scrolls the walk to it. On phones and under reduced motion nothing is held: the plan reads
   complete and a phase opens on a tap. */
export function MethodThread() {
  const [step, setStep] = useState({ phase: 0, checked: deliverablesOf(0) });
  const seek = useRef<((progress: number) => void) | null>(null);
  const walk = useCallback((timeline: gsap.core.Timeline) => {
    const progress = { value: 0 };
    setStep(stepAt(0));
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
    <ScrollScene
      choreography={walk}
      length="long"
      minWidth="md"
      below="header"
      onSeek={(next) => {
        seek.current = next;
        if (next === null) {
          setStep((current) => ({ ...current, checked: deliverablesOf(current.phase) }));
        }
      }}
    >
      <PhaseThread
        label="Les trois phases d’un projet"
        items={agentsMethod}
        backdrop={agentsMethodBackdrop}
        active={step.phase}
        checked={step.checked}
        onSelect={(phase) => {
          if (seek.current === null) {
            setStep({ phase, checked: deliverablesOf(phase) });
            return;
          }
          seek.current(completeAt(phase));
        }}
      />
    </ScrollScene>
  );
}
