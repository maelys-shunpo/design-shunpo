import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const gridVariants = cva("relative isolate", {
  variants: {
    columns: {
      "6": "",
      "12": "",
    },
  },
  defaultVariants: { columns: "12" },
});

const COLUMNS = { "6": 6, "12": 12 } as const;

interface BlueprintGridProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

/* The drawing board behind a section: hairline columns in the border token, under everything, never hit. */
export function BlueprintGrid({ columns, className, children, ...props }: BlueprintGridProps) {
  const count = COLUMNS[columns ?? "12"];
  return (
    <div data-slot="blueprint-grid" className={cn(gridVariants({ columns }), className)} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 mx-auto flex w-full max-w-wide px-5 opacity-50 md:px-8 lg:px-10"
      >
        {Array.from({ length: count }, (_, column) => (
          <span key={column} className="h-full flex-1 border-l border-border last:border-r" />
        ))}
      </div>
      {children}
    </div>
  );
}
