"use client";

import { useEffect, useState } from "react";

import { cn } from "../lib/cn.ts";

type EffectCleanup = (() => void) | undefined;

interface TabProgressProps {
  active: boolean;
  running: boolean;
  /* Milliseconds the bar takes to fill: the time before the next tab. */
  duration: number;
}

/* The hairline over a tab that fills while its agent plays; full and ink while the visitor holds it. */
export function TabProgress({ active, running, duration }: TabProgressProps) {
  const [started, setStarted] = useState(false);
  useEffect((): EffectCleanup => {
    if (!active || !running) {
      return undefined;
    }
    const frame = requestAnimationFrame(() => {
      setStarted(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [active, running]);
  const filling = started && active && running;
  return (
    <span
      aria-hidden
      data-slot="tab-progress"
      className="absolute inset-x-0 -top-px h-0.5 overflow-clip"
    >
      <span
        className={cn(
          "block size-full origin-left transition-transform ease-linear",
          filling ? "scale-x-100 bg-accent" : "scale-x-0 bg-accent",
          active && !running && "scale-x-100 bg-foreground",
        )}
        style={{ transitionDuration: filling ? `${String(duration)}ms` : "0ms" }}
      />
    </span>
  );
}
