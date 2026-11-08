import { cva, type VariantProps } from "class-variance-authority";
import type { ReactElement, ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const stageVariants = cva("relative isolate grid overflow-clip rounded-stage bg-muted", {
  variants: {
    padding: {
      /* Beside a column of text: the surface narrows to a frame on tablets, so the interface keeps its width. */
      sm: "px-4 py-8 sm:px-8 md:p-6 lg:p-12",
      md: "px-4 py-8 sm:px-8 md:p-12",
      lg: "px-4 py-10 sm:px-10 md:p-20",
    },
  },
  defaultVariants: { padding: "lg" },
});

/* How wide the interface sits on the surface: the full stage, or a narrower window with the surface around it. */
const contentVariants = cva("relative mx-auto w-full min-w-0", {
  variants: {
    width: {
      wide: "max-w-wide",
      narrow: "max-w-narrow",
    },
  },
  defaultVariants: { width: "wide" },
});

interface PhotoStageProps
  extends VariantProps<typeof stageVariants>, VariantProps<typeof contentVariants> {
  /* A next/image with `fill`: the photographed surface the interface rests on. Decorative. */
  backdrop: ReactElement;
  /* The interface, centred on the surface. */
  children: ReactNode;
  /* Pieces that float over a corner of the interface (a notification), from tablets up. */
  floating?: ReactNode;
  className?: string | undefined;
}

/* An interface laid on a photographed surface, the way a product is shot on a table: light, shadow, matter. */
export function PhotoStage({
  backdrop,
  children,
  floating,
  padding,
  width,
  className,
}: PhotoStageProps) {
  return (
    <div data-slot="photo-stage" className={cn(stageVariants({ padding }), className)}>
      <div aria-hidden className="absolute inset-0 -z-10 [&_img]:size-full [&_img]:object-cover">
        {backdrop}
      </div>
      <div className={contentVariants({ width })}>{children}</div>
      {floating === undefined ? null : (
        <div className="pointer-events-none absolute inset-e-6 bottom-6 hidden w-2/5 md:block lg:inset-e-10 lg:bottom-10 lg:w-1/3">
          {floating}
        </div>
      )}
    </div>
  );
}
