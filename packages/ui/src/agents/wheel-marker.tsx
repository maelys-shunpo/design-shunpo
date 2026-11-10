import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { blotImage } from "../lib/brush-ink.ts";
import { cn } from "../lib/cn.ts";

/* The point on the arc the wheel places (`translate`), held only from tablets up with motion. */
const markerVariants = cva(
  "group pointer-events-none absolute top-0 left-0 hidden size-0 md:motion-safe:block",
);

/* A drop of sumi: an imperfect round of ink, never a circle, its rim a little denser. Each one lands as the brush
   reaches its place (`data-landed`), wider than the stroke so it reads on the ink; the current one is half as large
   again, and the passed ones stay on the ink as it rises (200 ms). */
const dropVariants = cva(
  "absolute size-4 -translate-1/2 scale-0 bg-foreground transition group-data-landed:scale-200 group-data-landed:group-data-active:scale-300",
);

/* A few blots, drawn once: neighbouring dots never share a shape. */
const BLOTS = [11, 23, 37, 41, 53].map((seed) => `url("${blotImage(seed)}")`);

interface WheelMarkerDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "style"> {
  /* Which blot it is printed with. */
  index?: number;
}

/* One drop of the method's stroke (internal to `MethodWheel`): placed on the ink by the wheel's course, which marks it
   `data-landed` once the brush has reached it, `data-active` when its phase is the current one and `data-passed` once
   its phase is behind. */
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
