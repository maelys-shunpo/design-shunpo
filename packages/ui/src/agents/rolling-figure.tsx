"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { lazy, useState } from "react";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyRollingFigureMotion = lazy(async () => {
  const { RollingFigureMotion } = await import("./rolling-figure-motion.tsx");
  return { default: RollingFigureMotion };
});

const rollingFigureVariants = cva("font-display leading-none font-heading whitespace-nowrap");

const figureVariants = cva("", {
  variants: { size: { md: "text-3xl", lg: "text-4xl" } },
  defaultVariants: { size: "md" },
});

const unitVariants = cva("", {
  variants: { size: { md: "text-xl", lg: "text-2xl" } },
  defaultVariants: { size: "md" },
});

interface RollingFigureProps extends VariantProps<typeof figureVariants> {
  /* The key figure as its published case states it (« +1,4 ») and its unit (« M »). */
  figure: string;
  unit: string;
  className?: string;
}

/* A key figure whose digits roll like a counter: painted complete; once idle and in view, each digit's column rolls a
   full turn and stops on its value, left to right, while the other signs fade up (`RollingFigureMotion`). On the
   curved wall it rolls again each time its card comes to the front (`--ring-voice`). Readers hear the figure whole;
   reduced motion keeps it painted. */
export function RollingFigure({ figure, unit, size, className }: RollingFigureProps) {
  const [face, setFace] = useState<HTMLElement | null>(null);
  return (
    <span data-slot="rolling-figure" className={cn(rollingFigureVariants(), className)}>
      <span className="sr-only">{`${figure} ${unit}`}</span>
      <span aria-hidden="true" ref={setFace}>
        <span className={figureVariants({ size })}>{figure}</span>
        {" "}
        <span className={unitVariants({ size })}>{unit}</span>
      </span>
      <AfterIdle>
        <LazyRollingFigureMotion face={face} />
      </AfterIdle>
    </span>
  );
}
