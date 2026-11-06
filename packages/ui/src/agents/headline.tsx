import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const headlineVariants = cva("font-display font-heading text-foreground", {
  variants: {
    size: {
      hero: "text-7xl",
      display: "text-6xl",
      title: "text-5xl",
      subtitle: "text-3xl",
    },
    align: {
      start: "text-start",
      center: "text-center",
    },
  },
  defaultVariants: { size: "title", align: "start" },
});

type HeadlineLevel = 1 | 2 | 3;

interface HeadlineProps
  extends HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headlineVariants> {
  level: HeadlineLevel;
}

/* A large, light headline whose parts take tones (HeadlinePart): grey context around the words that matter. */
export function Headline({ level, size, align, className, ...props }: HeadlineProps) {
  const Element = `h${level}` as const;
  return (
    <Element
      data-slot="headline"
      className={cn(headlineVariants({ size, align }), className)}
      {...props}
    />
  );
}
