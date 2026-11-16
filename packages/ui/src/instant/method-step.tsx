import { cn } from "../lib/cn.ts";

interface MethodStepProps {
  kanji: string;
  /* The kanji's meaning, read in its place. */
  kanjiLabel: string;
  index: string;
  title: string;
  children: string;
  className?: string;
}

/* One step of the method under its kanji, brushed large above the text like the title of a scroll. */
export function MethodStep({
  kanji,
  kanjiLabel,
  index,
  title,
  children,
  className,
}: MethodStepProps) {
  return (
    <li
      data-slot="method-step"
      className={cn("grid content-start gap-6 border-t border-rule py-8", className)}
    >
      <span className="flex items-end justify-between gap-4">
        <span aria-hidden className="font-display text-8xl leading-none text-foreground">
          {kanji}
        </span>
        <span className="sr-only">{kanjiLabel}</span>
        <span className="font-display text-xl text-muted-foreground">{index}</span>
      </span>
      <h3 className="font-display text-3xl font-heading text-foreground">{title}</h3>
      <p className="max-w-prose text-md text-muted-foreground">{children}</p>
    </li>
  );
}
