"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { lazy, type ReactNode, useState } from "react";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyMarqueeMotion = lazy(async () => {
  const { MarqueeMotion } = await import("./marquee-motion.tsx");
  return { default: MarqueeMotion };
});

const viewportVariants = cva("w-full min-w-0 overflow-clip", {
  variants: {
    direction: {
      left: "mask-x-from-85% mask-x-to-100%",
      right: "mask-x-from-85% mask-x-to-100%",
      up: "aspect-2/5 min-h-0 mask-y-from-80% mask-y-to-100%",
      down: "aspect-2/5 min-h-0 mask-y-from-80% mask-y-to-100%",
    },
  },
  defaultVariants: { direction: "left" },
});

const trackVariants = cva("flex w-max gap-4", {
  variants: {
    direction: {
      left: "flex-row",
      right: "flex-row",
      up: "w-full flex-col",
      down: "w-full flex-col",
    },
  },
  defaultVariants: { direction: "left" },
});

export type MarqueeDirection = NonNullable<VariantProps<typeof viewportVariants>["direction"]>;

interface MarqueeProps extends VariantProps<typeof viewportVariants> {
  /* The items, once: the marquee repeats them out of the accessibility tree for the loop. */
  children: ReactNode;
  /* Seconds for one full lap. */
  lap?: number;
  label?: string;
  className?: string;
}

/* An endless row or column that drifts: references, tools. It stands still under reduced motion and off screen. */
export function Marquee({ children, direction, lap = 40, label, className }: MarqueeProps) {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  return (
    <div
      data-slot="marquee"
      role={label === undefined ? undefined : "group"}
      aria-label={label}
      className={cn(viewportVariants({ direction }), className)}
    >
      <div ref={setTrack} className={trackVariants({ direction })}>
        <div className={trackVariants({ direction })}>{children}</div>
        <div aria-hidden inert className={trackVariants({ direction })}>
          {children}
        </div>
      </div>
      <AfterIdle>
        <LazyMarqueeMotion track={track} direction={direction ?? "left"} lap={lap} />
      </AfterIdle>
    </div>
  );
}
