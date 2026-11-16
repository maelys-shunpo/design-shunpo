"use client";

import { lazy, type ReactNode, useState } from "react";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyLiveMotion = lazy(async () => {
  const { LiveMotion } = await import("./live-motion.tsx");
  return { default: LiveMotion };
});

interface LiveSurfaceProps {
  /* A mockup written in its final state. Its pieces carry `data-live="<order>"` and, when they do more than
     appear, `data-live-kind`: type (letter by letter), grow (a bar that fills), transient (shown during its
     step only, such as a typing indicator, and authored hidden). */
  children: ReactNode;
  /* Seconds the finished state holds before the loop starts again. */
  hold?: number | undefined;
  className?: string | undefined;
}

/* An interface that works by itself. The page paints it finished; once idle and in view, its pieces replay in
   order and loop, paused off screen, under the pointer and keyboard focus, and never run under reduced motion. */
export function LiveSurface({ children, hold = 3, className }: LiveSurfaceProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setRoot} data-slot="live-surface" className={cn("relative", className)}>
      {children}
      <AfterIdle>
        <LazyLiveMotion root={root} hold={hold} />
      </AfterIdle>
    </div>
  );
}
