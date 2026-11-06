import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { type LiveStep, liveAttributes } from "./live.ts";

const pillVariants = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        done: "bg-agents-ok-tint text-agents-ok",
        waiting: "bg-agents-wait-tint text-agents-wait",
        working: "bg-agents-info-tint text-agents-info",
        new: "bg-agents-signal-tint text-agents-ink",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const dotVariants = cva("size-2 shrink-0 rounded-full", {
  variants: {
    tone: {
      done: "bg-agents-ok",
      waiting: "bg-agents-wait",
      working: "bg-agents-info",
      new: "bg-agents-signal",
      neutral: "bg-muted-foreground",
    },
  },
  defaultVariants: { tone: "neutral" },
});

interface StatusPillProps extends VariantProps<typeof pillVariants>, LiveStep {
  children: ReactNode;
  className?: string | undefined;
}

/* A status inside a mockup: a dot and a word, coloured by what the agent is doing. */
export function StatusPill({ children, tone, live, liveKind, className }: StatusPillProps) {
  return (
    <span
      data-slot="status-pill"
      {...liveAttributes({ live, liveKind })}
      className={cn(pillVariants({ tone }), className)}
    >
      <span aria-hidden className={dotVariants({ tone })} />
      {children}
    </span>
  );
}
