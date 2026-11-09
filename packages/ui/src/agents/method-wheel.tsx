"use client";

import { cva } from "class-variance-authority";
import { type ReactElement, useCallback, useId, useRef } from "react";

import { Container } from "../layout/container.tsx";
import { cn } from "../lib/cn.ts";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { methodWheelCourse, settleWheel, WHEEL_HOLD } from "./method-wheel-course.ts";
import { WheelInk } from "./wheel-ink.tsx";
import { type WheelPhase, WheelStep } from "./wheel-step.tsx";

/* Phones and reduced motion: the question, then each phase under it. Held: the stage under the nav, the question over
   it, every phase stacked in one cell. Isolated, so the kanji lie under the copy and still above the page. */
const wheelVariants = cva(
  "relative isolate flex w-full flex-col gap-16 md:gap-24 md:motion-safe:block md:motion-safe:size-full",
);

const phasesVariants = cva(
  "flex flex-col gap-16 md:gap-24 md:motion-safe:grid md:motion-safe:size-full md:motion-safe:content-center md:motion-safe:gap-0 md:motion-safe:*:col-start-1 md:motion-safe:*:row-start-1",
);

interface MethodWheelProps {
  /* The method's question (an h2), alone on the paper before the wheel opens. */
  title: ReactElement;
  phases: readonly WheelPhase[];
  /* A next/image with `fill`: the photographed surface every board rests on. */
  backdrop: ReactElement;
  className?: string;
}

/* The method as the home page's wheel. Held under the floating nav from tablets up for three screens: the question
   stands alone, then rises and fades while a sumi stroke comes down a wide arc; when its drop falls the first phase is
   named, and the scroll moves the dots from phase to phase. The current phase's words come in line after line in the
   two-corner frame, its deliverables tick one by one, its board fades in on the photograph with its kanji rising
   behind it. Phones and reduced motion: the question, then every phase complete with its board. */
export function MethodWheel({ title, phases, backdrop, className }: MethodWheelProps) {
  const root = useRef<HTMLDivElement>(null);
  const ink = `wheel-ink-${useId().replaceAll(/[^\w-]/gu, "")}`;
  const walk = useCallback((timeline: gsap.core.Timeline) => {
    const paint = root.current === null ? undefined : methodWheelCourse(root.current);
    if (paint === undefined) {
      return;
    }
    const course = { held: 0 };
    paint(0);
    timeline.to(course, {
      held: WHEEL_HOLD,
      ease: "none",
      duration: 1,
      onUpdate: () => {
        paint(course.held);
      },
    });
  }, []);
  return (
    <ScrollScene
      choreography={walk}
      length="long"
      minWidth="md"
      below="header"
      onSeek={(seek) => {
        if (seek === null && root.current !== null) {
          settleWheel(root.current);
        }
      }}
    >
      <div ref={root} data-slot="method-wheel" className={cn(wheelVariants(), className)}>
        <div
          data-wheel-title
          className="grid agents-wheel-title place-items-center md:motion-safe:pointer-events-none md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:z-30"
        >
          <Container>{title}</Container>
        </div>
        <WheelInk ink={ink} dots={phases.length} />
        <ol className={phasesVariants()}>
          {phases.map((phase) => (
            <WheelStep key={phase.id} phase={phase} backdrop={backdrop} />
          ))}
        </ol>
      </div>
    </ScrollScene>
  );
}
