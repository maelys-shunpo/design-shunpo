import { cn } from "../lib/cn.ts";

interface Beat {
  name: string;
  line: string;
}

interface FilBeatsProps {
  beats: Beat[];
  label: string;
  className?: string;
}

/* The chapters of the kumihimo stand, read at the foot of the hero: the first is lit as the page paints, and the
   scene's choreography lights the others and fills the red rail as the threads are combed, then braided. A chapter
   in waiting keeps its name at AA contrast and hides its line, so no dimmed text fails a contrast check. */
export function FilBeats({ beats, label, className }: FilBeatsProps) {
  return (
    <div data-slot="fil-beats" className={cn("flex w-full flex-col gap-5", className)}>
      <span aria-hidden className="relative h-0.5 w-full rounded-full bg-rule">
        <span
          data-fil-beats-progress
          className="absolute inset-0 origin-left scale-x-0 rounded-full bg-accent"
        />
      </span>
      <ol aria-label={label} className="grid grid-cols-3 gap-2 md:gap-10">
        {beats.map((beat, index) => (
          <li key={beat.name} className="flex flex-col gap-1">
            <span
              data-fil-beat={index}
              className={cn(
                "font-display text-md font-semibold md:text-2xl",
                index > 0 && "opacity-70",
              )}
            >
              {`0${index + 1}`} {beat.name}
            </span>
            <span
              data-fil-beat-line={index}
              className={cn(
                "hidden text-sm text-muted-foreground md:block",
                index > 0 && "opacity-0",
              )}
            >
              {beat.line}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
