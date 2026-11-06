import { cn } from "../lib/cn.ts";

interface FilStepProps {
  index: string;
  title: string;
  detail: string;
  className?: string;
}

/* One step of FilSteps: a knot on the rail, then the gesture and what it changes. */
export function FilStep({ index, title, detail, className }: FilStepProps) {
  return (
    <li data-slot="fil-step" className={cn("flex flex-col gap-6", className)}>
      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full border-2 border-accent bg-muted font-display text-sm font-semibold"
      >
        {index}
      </span>
      <h3 className="font-display text-3xl font-heading text-balance">{title}</h3>
      <p className="text-md text-muted-foreground">{detail}</p>
    </li>
  );
}
