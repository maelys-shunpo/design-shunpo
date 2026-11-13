"use client";

import { cva } from "class-variance-authority";
import { lazy, type ReactNode, useRef } from "react";

import { AfterIdle } from "./after-idle.tsx";
import type { SceneBreakpoint, SceneScrub, SceneSeek } from "./scroll-scene-timeline.tsx";
import { sceneLength } from "./tokens.ts";

const LazyScrollSceneTimeline = lazy(async () => {
  const { ScrollSceneTimeline } = await import("./scroll-scene-timeline.tsx");
  return { default: ScrollSceneTimeline };
});

/* With motion, the stage sticks to the top of the window: CSS holds it in place, so nothing shifts the layout.
   The stage and its holds are measured in small-viewport units: a phone's toolbar that collapses or returns mid-scroll resizes neither the stage, its content nor the track, so the scrub, measured once, stays in step with the hold.
   Below a floating header, the stage is held under it and fills the rest of the window, so nothing hides behind the bar. */
const stageVariants = cva("grid grid-cols-1 place-items-center overflow-clip", {
  variants: {
    minWidth: {
      all: "motion-reduce:py-24",
      md: "py-24 md:motion-safe:py-0",
    },
    below: { window: "", header: "" },
  },
  compoundVariants: [
    {
      minWidth: "all",
      below: "window",
      className: "motion-safe:sticky motion-safe:top-0 motion-safe:h-svh",
    },
    {
      minWidth: "all",
      below: "header",
      className: "motion-safe:sticky motion-safe:top-header motion-safe:scene-below-header",
    },
    {
      minWidth: "md",
      below: "window",
      className: "md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-svh",
    },
    {
      minWidth: "md",
      below: "header",
      className:
        "md:motion-safe:sticky md:motion-safe:top-header md:motion-safe:scene-below-header",
    },
  ],
  defaultVariants: { below: "window" },
});

/* One window of scroll after the stage, during which the stage stays held and the story scrubs. */
const holdVariants = cva("h-svh", {
  variants: {
    minWidth: {
      all: "motion-reduce:hidden",
      md: "hidden md:motion-safe:block",
    },
  },
});

interface ScrollSceneProps {
  children: ReactNode;
  /* Shown instead of the scene under reduced motion: every stage of the story as a still plate. */
  still?: ReactNode;
  choreography: (timeline: gsap.core.Timeline) => void;
  /* How many windows of scroll the stage is held for: a named length, or a number of screens for a scene whose own
     course sets it (the question scene holds exactly as long as its course runs). */
  length?: keyof typeof sceneLength | number;
  minWidth?: SceneBreakpoint;
  /* direct for a world that smooths itself (a spring): a scrub on top would leave it behind its copy. */
  scrub?: SceneScrub;
  /* window holds the stage at the top of the window; header holds it under the page's floating header. */
  below?: "window" | "header";
  /* Handed, once the scene plays, a function that scrolls the page to a point of the scene (0 to 1), and null when
     it stops (phones under `minWidth`, reduced motion): a control can then walk the scene the way the scroll does. */
  onSeek?: (seek: SceneSeek | null) => void;
}

export function ScrollScene({
  children,
  still,
  choreography,
  length = "medium",
  minWidth = "all",
  scrub = "smoothed",
  below = "window",
  onSeek,
}: ScrollSceneProps) {
  const track = useRef<HTMLDivElement>(null);
  const screens = typeof length === "number" ? length : sceneLength[length];
  const whole = Math.floor(screens);
  const rest = screens - whole;

  return (
    <div ref={track} data-slot="scroll-scene">
      <div className={stageVariants({ minWidth, below })}>
        {still === undefined ? (
          children
        ) : (
          <>
            <div className="w-full motion-reduce:hidden">{children}</div>
            <div className="hidden w-full motion-reduce:block">{still}</div>
          </>
        )}
      </div>
      {Array.from({ length: whole }, (_, screen) => (
        <div key={screen} className={holdVariants({ minWidth })} />
      ))}
      {rest > 0 ? (
        /* The part of a window left over, in the same small-viewport unit as the full ones. */
        <div
          className={holdVariants({ minWidth })}
          style={{ height: `${String(rest * 100)}svh` }}
        />
      ) : null}
      <AfterIdle>
        <LazyScrollSceneTimeline
          track={track}
          choreography={choreography}
          minWidth={minWidth}
          scrub={scrub}
          onSeek={onSeek}
        />
      </AfterIdle>
    </div>
  );
}
