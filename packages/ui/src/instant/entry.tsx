import { cn } from "../lib/cn.ts";

interface EntryProps {
  index: string;
  title: string;
  children: string;
  className?: string;
}

/* One item of a numbered list, under a hairline: the number large in the display face, the title, then the text. */
export function Entry({ index, title, children, className }: EntryProps) {
  return (
    <li
      data-slot="entry"
      className={cn(
        "grid grid-cols-1 gap-4 border-t border-rule py-8 sm:grid-cols-6 sm:gap-6",
        className,
      )}
    >
      <span aria-hidden className="font-display text-4xl font-semibold text-foreground">
        {index}
      </span>
      <div className="grid gap-3 sm:col-span-5">
        <h3 className="font-display text-2xl font-heading text-foreground">{title}</h3>
        <p className="max-w-prose text-md text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}
