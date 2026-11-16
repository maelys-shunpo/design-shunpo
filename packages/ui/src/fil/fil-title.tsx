import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

/* The display type of « Le fil »: Bricolage Grotesque set tight, condensed at the largest sizes so a headline
   fills the field like a woven band. */
const titleVariants = cva("font-display font-heading text-balance", {
  variants: {
    size: {
      mega: "text-8xl font-stretch-condensed",
      hero: "text-7xl font-stretch-condensed",
      display: "text-6xl font-stretch-semi-condensed",
      title: "text-4xl",
      subtitle: "text-2xl",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      accent: "text-accent",
    },
    align: {
      start: "text-start",
      center: "text-center",
    },
    /* Held under the window's top while the column beside it is read (from the desktop breakpoint). */
    pinned: {
      true: "lg:sticky lg:top-24",
      false: "",
    },
  },
  defaultVariants: { size: "title", tone: "default", align: "start", pinned: false },
});

type TitleLevel = 1 | 2 | 3;

interface FilTitleProps
  extends HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof titleVariants> {
  level: TitleLevel;
}

export function FilTitle({ level, size, tone, align, pinned, className, ...props }: FilTitleProps) {
  const Element = `h${level}` as const;
  return (
    <Element
      data-slot="fil-title"
      className={cn(titleVariants({ size, tone, align, pinned }), className)}
      {...props}
    />
  );
}
