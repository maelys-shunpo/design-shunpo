import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

/* The red thread's course through a section, in a 100 × 100 box stretched over it: it runs down a gutter and
   crosses under the content in the bottom padding, so it never runs over the copy. Each course leaves where the
   next one enters. */
const threadCourses = {
  enter: "M64 0 C58 7 10 4 4 12 C3 40 3 72 5 86 C7 97 60 92 96 100",
  left: "M4 0 C4 40 3 70 5 86 C7 97 60 92 96 100",
  right: "M96 0 C96 40 97 70 95 86 C93 97 40 92 4 100",
  end: "M4 0 C4 40 3 70 5 84 C7 95 45 90 50 100",
} as const;

/* The thread stays Fushimi on every ground, including the Tenku field where the accent turns to Kome. */
const FUSHIMI = { stroke: "var(--brand-fushimi)" } as const;

export type ThreadCourse = keyof typeof threadCourses;

const sectionVariants = cva("relative isolate overflow-clip text-foreground", {
  variants: {
    ground: {
      kome: "bg-background",
      shiro: "bg-muted",
      tenku: "bg-background scheme-field",
      fuji: "bg-background scheme-dark",
    },
    spacing: {
      md: "py-24 md:py-32",
      lg: "py-32 md:py-48",
    },
  },
  defaultVariants: { ground: "kome", spacing: "md" },
});

interface FilSectionProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  thread?: ThreadCourse;
  as?: "section" | "footer";
}

/* A band of colour of « Le fil », with the course of the red thread through it. The thread shows from the
   desktop breakpoint, where the gutters leave it room; FilThread draws it with the scroll. */
export function FilSection({
  as: Element = "section",
  ground,
  spacing,
  thread,
  className,
  children,
  ...props
}: FilSectionProps) {
  return (
    <Element
      data-slot="fil-section"
      className={cn(sectionVariants({ ground, spacing }), className)}
      {...props}
    >
      {thread === undefined ? null : (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 -z-10 hidden size-full overflow-visible xl:block"
        >
          <path
            data-fil-thread={thread}
            d={threadCourses[thread]}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            className="stroke-3"
            style={FUSHIMI}
          />
        </svg>
      )}
      {children}
    </Element>
  );
}
