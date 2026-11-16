import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

/* A double page: a narrow margin column for the title and a wide column for the text, as in a printed book.
   The margin can hold its place while the text scrolls past it. */
const spreadVariants = cva("grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8", {
  variants: {
    align: {
      start: "items-start",
      stretch: "items-stretch",
    },
  },
  defaultVariants: { align: "start" },
});

const marginVariants = cva("lg:col-span-4", {
  variants: {
    hold: {
      true: "lg:sticky lg:top-12",
      false: "",
    },
  },
  defaultVariants: { hold: false },
});

interface SpreadProps
  extends VariantProps<typeof spreadVariants>, VariantProps<typeof marginVariants> {
  margin: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Spread({ margin, children, align, hold, className }: SpreadProps) {
  return (
    <div data-slot="spread" className={cn(spreadVariants({ align }), className)}>
      <div className={marginVariants({ hold })}>{margin}</div>
      <div className="lg:col-span-7 lg:col-start-6">{children}</div>
    </div>
  );
}
