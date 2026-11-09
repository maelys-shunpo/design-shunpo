import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { blotImage } from "../lib/brush-ink.ts";
import { cn } from "../lib/cn.ts";

/* The point on the arc the wheel places (`translate`), held only from tablets up with motion. */
const markerVariants = cva(
  "group pointer-events-none absolute top-0 left-0 hidden size-0 md:motion-safe:block",
);

/* A drop of sumi: an imperfect round of ink, never a circle, its rim a little denser. The current phase's grows twice as
   large, the passed ones fade, together (200 ms). */
const dropVariants = cva(
  "absolute size-4 -translate-1/2 bg-foreground transition group-data-active:scale-200 group-data-passed:opacity-0",
);

/* A few blots, drawn once: neighbouring dots never share a shape. */
const BLOTS = [11, 23, 37, 41, 53].map((seed) => `url("${blotImage(seed)}")`);

interface WheelMarkerDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "style"> {
  /* Which blot it is printed with. */
  index?: number;
}

/* One dot of the method wheel (internal to `MethodWheel`): placed on the arc by the wheel's course, which marks it
   `data-active` when its phase is the current one and `data-passed` once its phase is behind. */
export function WheelMarkerDot({ index = 0, className, ...props }: WheelMarkerDotProps) {
  const blot = BLOTS[index % BLOTS.length];
  return (
    <span
      data-slot="wheel-marker"
      data-wheel-dot
      aria-hidden="true"
      className={cn(markerVariants(), className)}
      {...props}
    >
      <span
        className={dropVariants()}
        style={{
          maskImage: blot,
          maskSize: "100% 100%",
          WebkitMaskImage: blot,
          WebkitMaskSize: "100% 100%",
        }}
      />
    </span>
  );
}
