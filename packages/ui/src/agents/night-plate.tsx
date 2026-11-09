import { cva } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const plateVariants = cva(
  "flex flex-col gap-1 rounded-surface bg-surface p-3 text-foreground md:gap-2 md:p-5",
);

interface NightPlateProps {
  number: string;
  title: string;
  text: string;
  className?: string | undefined;
}

/* A plate lifted off a Fuji Night island that names one thing: its number, a title (h3, in the display serif) and a
   sentence. Compact on phones. Dark islands only. */
export function NightPlate({ number, title, text, className }: NightPlateProps) {
  return (
    <article data-slot="night-plate" className={cn(plateVariants(), className)}>
      <p className="font-mono text-xs text-muted-foreground md:text-sm">{number}</p>
      <h3 className="font-display text-lg text-balance md:text-2xl">{title}</h3>
      <p className="text-sm text-muted-foreground md:text-md">{text}</p>
    </article>
  );
}
