"use client";

import { lazy, type ReactNode, useRef } from "react";

import { AfterIdle } from "./after-idle.tsx";

const LazyScrollSceneTimeline = lazy(async () => {
  const { ScrollSceneTimeline } = await import("./scroll-scene-timeline.tsx");
  return { default: ScrollSceneTimeline };
});

interface OrigamiJourneyProps {
  /* The stage: held in the window while the chapters scroll over it. */
  stage: ReactNode;
  /* The chapters, in normal flow: their height is the length of the journey. */
  children: ReactNode;
  /* Scrubbed from the top of the journey to its end, once the page is idle and only when motion is allowed. */
  choreography: (timeline: gsap.core.Timeline) => void;
}

/* One world behind normally scrolling copy: the stage sits in a layer of its own, sticky in the window for the
   whole journey, and the chapters scroll over it. The layer is out of flow, so nothing overlaps in the layout;
   the chapters let the pointer through to the stage's pause control, except on their own copy. Under reduced
   motion the stage stays out and each chapter shows its own still plate. */
export function OrigamiJourney({ stage, children, choreography }: OrigamiJourneyProps) {
  const track = useRef<HTMLDivElement>(null);
  return (
    <div ref={track} data-slot="origami-journey" className="relative">
      <div className="absolute inset-0 motion-reduce:hidden">
        <div className="sticky top-0 h-svh">{stage}</div>
      </div>
      <div className="pointer-events-none relative">{children}</div>
      <AfterIdle>
        <LazyScrollSceneTimeline
          track={track}
          choreography={choreography}
          minWidth="all"
          scrub="smoothed"
        />
      </AfterIdle>
    </div>
  );
}
