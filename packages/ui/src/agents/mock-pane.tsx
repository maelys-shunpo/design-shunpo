import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const paneVariants = cva("min-w-0 flex-col gap-3 p-4", {
  variants: {
    /* From which width the pane shows: the agent's panel always, the list from tablets, the document from desktops. */
    from: {
      all: "flex",
      md: "hidden md:flex",
      lg: "hidden lg:flex",
    },
    tone: {
      paper: "bg-agents-paper",
      white: "bg-surface",
    },
  },
  defaultVariants: { from: "all", tone: "paper" },
});

interface MockPaneProps extends VariantProps<typeof paneVariants> {
  /* The pane's heading, in the small grey of an app. */
  title: string;
  /* A count or filter beside the heading. */
  meta?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}

/* One column of a mockup window. */
export function MockPane({ title, meta, from, tone, children, className }: MockPaneProps) {
  return (
    <section
      data-slot="mock-pane"
      aria-label={title}
      className={cn(paneVariants({ from, tone }), className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {meta === undefined ? null : (
          <span className="font-mono text-xs text-muted-foreground">{meta}</span>
        )}
      </div>
      {children}
    </section>
  );
}
