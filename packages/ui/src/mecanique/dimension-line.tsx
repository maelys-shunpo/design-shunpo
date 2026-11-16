import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const dimensionVariants = cva("flex w-full items-center gap-3 font-mono text-xs uppercase", {
  variants: {
    tone: {
      muted: "text-muted-foreground",
      signal: "text-secondary",
    },
  },
  defaultVariants: { tone: "muted" },
});

interface DimensionLineProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof dimensionVariants> {
  /* The measure written on the line. */
  label: string;
}

/* A dimension line: two ticks, the hairline between them, the measure in its middle. Its two halves carry
   data-scene-item="dimension-half", so a choreography can draw them out from the label (scaleX). */
export function DimensionLine({ label, tone, className, ...props }: DimensionLineProps) {
  return (
    <div
      data-slot="dimension-line"
      className={cn(dimensionVariants({ tone }), className)}
      {...props}
    >
      <span aria-hidden className="h-3 w-px bg-current" />
      <span
        aria-hidden
        data-scene-item="dimension-half"
        className="h-px flex-1 origin-right bg-current"
      />
      <span className="shrink-0 tracking-wide">{label}</span>
      <span
        aria-hidden
        data-scene-item="dimension-half"
        className="h-px flex-1 origin-left bg-current"
      />
      <span aria-hidden className="h-3 w-px bg-current" />
    </div>
  );
}
