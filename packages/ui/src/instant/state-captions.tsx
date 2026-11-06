import { cn } from "../lib/cn.ts";

export interface DrawingState {
  id: string;
  title: string;
  text: string;
}

interface StateCaptionsProps {
  states: DrawingState[];
  className?: string;
}

function number(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/* The caption of each drawing, stacked in one place: the first shows as painted, the scroll scene swaps them on
   each jump (data-instant-state) and fills the tick of the drawing in view (data-instant-tick). */
export function StateCaptions({ states, className }: StateCaptionsProps) {
  const total = number(states.length - 1);
  return (
    <div
      data-slot="state-captions"
      className={cn("grid gap-4 border-t border-rule py-4", className)}
    >
      <div aria-hidden className="flex gap-2">
        {states.map((state, index) => (
          <span
            key={state.id}
            data-instant-tick={index}
            className={cn("h-0.5 w-8 bg-foreground", index === 0 ? "opacity-100" : "opacity-20")}
          />
        ))}
      </div>
      <ol className="grid">
        {states.map((state, index) => (
          <li
            key={state.id}
            data-instant-state={index}
            className={cn(
              "col-start-1 row-start-1 grid gap-1",
              index === 0 ? "" : "invisible opacity-0",
            )}
          >
            <p className="flex items-baseline gap-3">
              <span className="text-sm text-muted-foreground">
                {number(index)} / {total}
              </span>
              <span className="font-display text-2xl font-heading text-foreground">
                {state.title}
              </span>
            </p>
            <p className="max-w-prose text-sm text-muted-foreground">{state.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
