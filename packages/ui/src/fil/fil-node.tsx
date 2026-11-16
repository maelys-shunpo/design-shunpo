import { cn } from "../lib/cn.ts";

interface FilNodeProps {
  index: string;
  title: string;
  detail: string;
  className?: string;
}

/* One knot of a list: the number tied in a ring that takes the red thread's colour under the pointer. */
export function FilNode({ index, title, detail, className }: FilNodeProps) {
  return (
    <li data-slot="fil-node" className={cn("group/fil-node flex flex-col gap-5", className)}>
      <span
        aria-hidden
        className="grid size-12 place-items-center rounded-full border-2 border-foreground font-display text-sm font-semibold transition-colors duration-300 group-hover/fil-node:border-accent group-hover/fil-node:bg-accent group-hover/fil-node:text-accent-foreground"
      >
        {index}
      </span>
      <span className="font-display text-2xl font-semibold text-balance">{title}</span>
      <span className="text-md text-muted-foreground">{detail}</span>
    </li>
  );
}
