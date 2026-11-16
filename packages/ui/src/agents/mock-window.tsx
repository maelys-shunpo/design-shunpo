import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const bodyVariants = cva("grid min-h-0 flex-1 divide-agents-line bg-agents-paper", {
  variants: {
    layout: {
      single: "grid-cols-1",
      split: "grid-cols-1 md:grid-cols-2 md:divide-x",
      /* A list, a document and the agent's panel, the way an inbox is laid out. */
      triple: "grid-cols-1 md:grid-cols-2 md:divide-x lg:grid-cols-3",
    },
  },
  defaultVariants: { layout: "single" },
});

interface MockWindowProps extends VariantProps<typeof bodyVariants> {
  /* The app's name in its title bar, such as « Agent factures ». */
  title: string;
  /* Where the app lives: « Back-office · Lyon ». */
  context?: string | undefined;
  /* The top-right corner: a status, a button. */
  status?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
}

/* The window of an application built by SHUNPO, shown on a photographed surface: a sheet cut 20 px deep, its white
   title bar over a paper body, hairlines, a shadow that follows the cut. */
export function MockWindow({
  title,
  context,
  status,
  layout,
  children,
  className,
}: MockWindowProps) {
  return (
    <div
      data-slot="mock-window"
      className={cn(
        "@container agents-sheet agents-sheet-ring flex w-full flex-col overflow-clip text-agents-ink agents-sheet-float",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-agents-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="flex gap-1">
            <span className="size-3 rounded-full bg-agents-line" />
            <span className="size-3 rounded-full bg-agents-line" />
            <span className="size-3 rounded-full bg-agents-line" />
          </span>
          {/* The name never gives way; in a narrow window the context drops under it and wraps rather than squeezing it. */}
          <span className="flex min-w-0 flex-col @prose:flex-row @prose:items-baseline @prose:gap-3">
            <span className="text-sm font-medium whitespace-nowrap">{title}</span>
            {context === undefined ? null : (
              <span className="text-xs text-muted-foreground @prose:truncate @prose:text-sm">
                {context}
              </span>
            )}
          </span>
        </div>
        {status}
      </div>
      <div className={bodyVariants({ layout })}>{children}</div>
    </div>
  );
}
