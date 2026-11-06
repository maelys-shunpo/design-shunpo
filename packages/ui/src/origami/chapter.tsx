import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

/* A chapter of the journey: one window tall, its copy on the left of a wide screen (the camera frames the paper
   on the right) and at the foot of a phone, on a veil that keeps it readable over the paper. Under reduced
   motion its still plate, the fold this chapter tells, shows beside the copy. */
const chapterVariants = cva(
  "flex min-h-svh flex-col px-6 py-24 md:px-12 lg:flex-row lg:items-center lg:px-20",
  {
    variants: {
      place: {
        hero: "justify-end lg:justify-start",
        body: "justify-end lg:justify-start",
      },
    },
    defaultVariants: { place: "body" },
  },
);

interface ChapterProps extends VariantProps<typeof chapterVariants> {
  id?: string | undefined;
  /* A short mark above the title: a roman numeral, an index or a kicker. */
  index: string;
  title: ReactNode;
  children: ReactNode;
  /* The fold as a still image, shown only under reduced motion. */
  still?: ReactNode;
  className?: string;
}

export function Chapter({ id, index, title, children, still, place, className }: ChapterProps) {
  return (
    <section
      id={id}
      data-slot="origami-chapter"
      className={cn(chapterVariants({ place }), className)}
    >
      <div className="pointer-events-auto flex w-full max-w-prose flex-col gap-6 bg-background/85 p-6 lg:bg-transparent lg:p-0">
        <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">{index}</p>
        {title}
        <div className="flex flex-col gap-4 text-lg text-muted-foreground">{children}</div>
      </div>
      {still === undefined ? null : (
        <div className="hidden w-full max-w-prose motion-reduce:block lg:max-w-none">{still}</div>
      )}
    </section>
  );
}
