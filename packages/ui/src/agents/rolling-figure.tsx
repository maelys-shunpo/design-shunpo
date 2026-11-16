"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { lazy, useState } from "react";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyRollingFigureMotion = lazy(async () => {
  const { RollingFigureMotion } = await import("./rolling-figure-motion.tsx");
  return { default: RollingFigureMotion };
});

const rollingFigureVariants = cva(
  "font-display leading-none font-medium whitespace-nowrap lining-nums tabular-nums",
);

const figureVariants = cva("", {
  variants: { size: { md: "text-3xl md:text-4xl", lg: "text-4xl" } },
  defaultVariants: { size: "md" },
});

const unitVariants = cva("", {
  variants: { size: { md: "text-xl md:text-2xl", lg: "text-2xl" } },
  defaultVariants: { size: "md" },
});

/* When the figure rolls. `seen` (default): once idle and scrolled into view, as on the references wall. `reveal`: once
   on its own arrival even when already in view, for a figure a state change brings in under the reader's eye, like the
   calculator's result landing after the last question. */
type RollTrigger = "seen" | "reveal";

interface RollingFigureProps extends VariantProps<typeof figureVariants> {
  /* The key figure as its published case states it (« +1,4 ») and its unit (« M »). */
  figure: string;
  unit: string;
  roll?: RollTrigger | undefined;
  className?: string;
}

/* A key figure whose digits roll like a counter: painted complete; each digit's column rolls a full turn and stops on
   its value, left to right, while the other signs fade up (`RollingFigureMotion`), on arrival (`roll`). On the curved
   wall it rolls again each time its card comes to the front (`--ring-voice`). Readers hear the figure whole; reduced
   motion keeps it painted. */
export function RollingFigure({ figure, unit, size, roll, className }: RollingFigureProps) {
  const [face, setFace] = useState<HTMLElement | null>(null);
  return (
    <span data-slot="rolling-figure" className={cn(rollingFigureVariants(), className)}>
      <span className="sr-only">{`${figure} ${unit}`}</span>
      <span aria-hidden="true" ref={setFace}>
        <span className={figureVariants({ size })}>{figure}</span>
        <span className={figureVariants({ size })}>{"\u00A0"}</span>
        <span className={unitVariants({ size })}>{unit}</span>
      </span>
      <AfterIdle>
        <LazyRollingFigureMotion face={face} roll={roll} />
      </AfterIdle>
    </span>
  );
}
