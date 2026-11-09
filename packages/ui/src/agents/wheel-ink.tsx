import { cva } from "class-variance-authority";

import { cn } from "../lib/cn.ts";
import { WheelMarkerDot } from "./wheel-marker.tsx";

const FULL = { x: 0, y: 0, width: "100%", height: "100%" } as const;

const inkVariants = cva(
  "pointer-events-none absolute inset-0 hidden size-full overflow-visible md:motion-safe:block",
);

interface WheelInkProps {
  /* A unique prefix for the masks' ids. */
  ink: string;
  dots: number;
  className?: string;
}

/* The stroke along the wheel and its dots (internal to `MethodWheel`), drawn by the wheel's course from tablets up with
   motion. The stroke is one sumi brush stroke (`paintBrushStroke`), rasterised once into `data-wheel-ink`; the course
   reveals it along its centre line (`data-wheel-brush`), as the brush travels down the arc. */
export function WheelInk({ ink, dots, className }: WheelInkProps) {
  return (
    <>
      <svg data-slot="wheel-ink" aria-hidden="true" className={cn(inkVariants(), className)}>
        <defs>
          <mask id={`${ink}-reveal`} maskUnits="userSpaceOnUse" {...FULL}>
            <path
              data-wheel-brush
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1}
            />
          </mask>
          <mask id={`${ink}-ink`} maskUnits="userSpaceOnUse" {...FULL}>
            <image data-wheel-ink mask={`url(#${ink}-reveal)`} />
          </mask>
        </defs>
        <rect {...FULL} className="fill-foreground" mask={`url(#${ink}-ink)`} />
      </svg>
      {Array.from({ length: dots }, (_, index) => (
        <WheelMarkerDot key={index} index={index} />
      ))}
    </>
  );
}
