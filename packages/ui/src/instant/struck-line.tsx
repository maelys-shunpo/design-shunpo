import { cn } from "../lib/cn.ts";

interface StruckLineProps {
  /* What is usually sold: struck through by a stroke of ink. */
  sold: string;
  /* What is actually bought. */
  bought: string;
  className?: string;
}

/* A correction in the margin of a proof: the term crossed out, the right words set beside it.
   Authored in its final state; a scroll scene draws the stroke and brings the words in (data-scene-item). */
export function StruckLine({ sold, bought, className }: StruckLineProps) {
  return (
    <li
      data-slot="struck-line"
      className={cn(
        "grid grid-cols-1 items-baseline gap-2 border-t border-border py-6 md:grid-cols-12 md:gap-8",
        className,
      )}
    >
      <span className="relative justify-self-start text-2xl text-muted-foreground md:col-span-4">
        <del data-scene-item="sold" className="no-underline">
          {sold}
        </del>
        <span
          aria-hidden
          data-scene-item="strike"
          className="absolute inset-x-0 top-1/2 h-0.5 origin-left bg-foreground"
        />
      </span>
      <span className="overflow-hidden md:col-span-8">
        <ins
          data-scene-item="bought"
          className="block font-display text-4xl font-heading text-foreground no-underline"
        >
          {bought}
        </ins>
      </span>
    </li>
  );
}
