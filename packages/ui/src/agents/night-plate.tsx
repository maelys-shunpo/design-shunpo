import { cva } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const plateVariants = cva(
  "flex flex-col gap-1 rounded-surface bg-surface p-3 text-foreground md:gap-2 md:p-5",
);

interface NightPlateProps {
  title: string;
  text: string;
  className?: string | undefined;
}

/* A plate lifted off a Fuji Night island that names one thing: a title (h3, in the display serif) and a sentence, with
   no number (the things it names have no order). Compact on phones. Dark islands only. */
export function NightPlate({ title, text, className }: NightPlateProps) {
  return (
    <article data-slot="night-plate" className={cn(plateVariants(), className)}>
      <h3 className="font-display text-lg text-balance md:text-2xl">{title}</h3>
      <p className="text-sm text-muted-foreground md:text-md">{text}</p>
    </article>
  );
}
