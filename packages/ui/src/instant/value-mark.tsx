import { cn } from "../lib/cn.ts";

interface ValueMarkProps {
  kanji: string;
  name: string;
  className?: string;
}

/* One value: its kanji large, as a brushed character, its name under it. The kanji is a picture of the name. */
export function ValueMark({ kanji, name, className }: ValueMarkProps) {
  return (
    <li data-slot="value-mark" className={cn("grid justify-items-start gap-3", className)}>
      <span aria-hidden className="font-display text-6xl leading-none text-foreground">
        {kanji}
      </span>
      <span className="text-sm font-medium text-muted-foreground">{name}</span>
    </li>
  );
}
