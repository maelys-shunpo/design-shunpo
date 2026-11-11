import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";
import { HeadlineEntrance, type HeadlineEntranceKind } from "./headline-entrance.tsx";

const headlineVariants = cva("font-display font-heading text-foreground", {
  variants: {
    size: {
      hero: "text-7xl",
      display: "text-6xl",
      /* Chapter openers. */
      title: "text-5xl",
      /* Functional sections: questions, try-outs. */
      heading: "text-4xl",
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
  /* How the headline enters, once per visit, as it comes a third of the way into the window: `lines` rise from behind
     their edge (section titles), `letters` rise one by one (the closing call), `throw` sends the shuriken across a
     one-line title. Painted complete until then; reduced motion keeps it painted. */
  entrance?: HeadlineEntranceKind;
}

/* A large, light headline whose parts take tones (HeadlinePart): grey context around the words that matter. */
export function Headline({ level, size, align, entrance, className, ...props }: HeadlineProps) {
  const Element = `h${level}` as const;
  const heading = (
    <Element
      data-slot="headline"
      className={cn(headlineVariants({ size, align }), className)}
      {...props}
    />
  );
  if (entrance === undefined) {
    return heading;
  }
  return (
    <>
      {heading}
      <HeadlineEntrance kind={entrance} />
    </>
  );
}
