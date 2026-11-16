"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { lazy, type ReactNode, useState } from "react";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyMarqueeMotion = lazy(async () => {
  const { MarqueeMotion } = await import("./marquee-motion.tsx");
  return { default: MarqueeMotion };
});

/* `extent` sizes a vertical marquee: `tile` keeps the 2:5 logo ratio, `window` a card-tall column (`agents-drift-window`);
   it only touches `up`/`down`. `still` says what reduced motion does: `clip` holds the clipped viewport, `unfold` drops
   the height, mask and clip so every card stands whole: a column unfolds down the page, a row unfolds into a stacked
   column so the whole row reads too. */
const viewportVariants = cva("w-full min-w-0 overflow-clip", {
  variants: {
    direction: {
      left: "mask-x-from-85% mask-x-to-100%",
      right: "mask-x-from-85% mask-x-to-100%",
      up: "min-h-0 mask-y-from-80% mask-y-to-100%",
      down: "min-h-0 mask-y-from-80% mask-y-to-100%",
    },
    extent: { tile: "", window: "" },
    still: { clip: "", unfold: "" },
  },
  compoundVariants: [
    { direction: "up", extent: "tile", class: "aspect-2/5" },
    { direction: "down", extent: "tile", class: "aspect-2/5" },
    { direction: "up", extent: "window", class: "agents-drift-window" },
    { direction: "down", extent: "window", class: "agents-drift-window" },
    {
      direction: "up",
      still: "unfold",
      class: "motion-reduce:aspect-auto motion-reduce:overflow-visible motion-reduce:mask-none",
    },
    {
      direction: "down",
      still: "unfold",
      class: "motion-reduce:aspect-auto motion-reduce:overflow-visible motion-reduce:mask-none",
    },
    {
      direction: "left",
      still: "unfold",
      class: "motion-reduce:overflow-visible motion-reduce:mask-none",
    },
    {
      direction: "right",
      still: "unfold",
      class: "motion-reduce:overflow-visible motion-reduce:mask-none",
    },
  ],
  defaultVariants: { direction: "left", extent: "tile", still: "clip" },
});

/* A row is as long as its items; a column is as wide as its lane, so its items wrap inside it. The two copies touch:
   each copy carries half a gap on both ends, so moving the track by half its length lands exactly one copy on, with
   no jump at the loop. */
const trackVariants = cva("flex", {
  variants: {
    direction: {
      left: "w-max flex-row",
      right: "w-max flex-row",
      up: "w-full flex-col",
      down: "w-full flex-col",
    },
    still: { clip: "", unfold: "" },
  },
  compoundVariants: [
    { direction: "left", still: "unfold", class: "motion-reduce:w-full motion-reduce:flex-col" },
    { direction: "right", still: "unfold", class: "motion-reduce:w-full motion-reduce:flex-col" },
  ],
  defaultVariants: { direction: "left", still: "clip" },
});

/* The repeated copy carries the loop; when a column unfolds under reduced motion it holds no second copy, so each card
   is read once. */
const copyVariants = cva("flex gap-4", {
  variants: {
    direction: {
      left: "w-max flex-row px-2",
      right: "w-max flex-row px-2",
      up: "w-full flex-col py-2",
      down: "w-full flex-col py-2",
    },
    still: { clip: "", unfold: "" },
    repeated: { true: "", false: "" },
  },
  compoundVariants: [
    { still: "unfold", repeated: true, class: "motion-reduce:hidden" },
    { direction: "left", still: "unfold", class: "motion-reduce:w-full motion-reduce:flex-col" },
    { direction: "right", still: "unfold", class: "motion-reduce:w-full motion-reduce:flex-col" },
  ],
  defaultVariants: { direction: "left", still: "clip", repeated: false },
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

/* An endless row or column that drifts: references, tools, testimonials. It stands still under reduced motion and off
   screen, and holds under the pointer and while something inside it has focus. */
export function Marquee({
  children,
  direction,
  extent,
  still,
  lap = 40,
  label,
  className,
}: MarqueeProps) {
  const [track, setTrack] = useState<HTMLDivElement | null>(null);
  return (
    <div
      data-slot="marquee"
      role={label === undefined ? undefined : "group"}
      aria-label={label}
      className={cn(viewportVariants({ direction, extent, still }), className)}
    >
      <div ref={setTrack} className={trackVariants({ direction, still })}>
        <div className={copyVariants({ direction, still, repeated: false })}>{children}</div>
        <div aria-hidden inert className={copyVariants({ direction, still, repeated: true })}>
          {children}
        </div>
      </div>
      <AfterIdle>
        <LazyMarqueeMotion track={track} direction={direction ?? "left"} lap={lap} />
      </AfterIdle>
    </div>
  );
}
