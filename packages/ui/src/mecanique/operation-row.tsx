import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const rowVariants = cva("flex items-baseline gap-4 border-t border-border", {
  variants: {
    density: {
      compact: "py-3",
      roomy: "py-6",
      adaptive: "py-3 lg:py-6",
    },
  },
  defaultVariants: { density: "roomy" },
});

/* In the adaptive density a phone shows the titles only, so a held scene keeps its figure in the window. */
const detailVariants = cva("max-w-prose text-md text-muted-foreground", {
  variants: {
    density: {
      compact: "hidden",
      roomy: "",
      adaptive: "hidden lg:block",
    },
  },
  defaultVariants: { density: "roomy" },
});

interface OperationRowProps
  extends Omit<HTMLAttributes<HTMLLIElement>, "title">, VariantProps<typeof rowVariants> {
  index: string;
  title: ReactNode;
  /* The line under the title; omit it in a compact list. */
  detail?: ReactNode;
}

/* One operation of the movement's assembly: its number, its name and what it does. */
export function OperationRow({
  index,
  title,
  detail,
  density,
  className,
  ...props
}: OperationRowProps) {
  return (
    <li data-slot="operation-row" className={cn(rowVariants({ density }), className)} {...props}>
      <span className="w-16 shrink-0 font-mono text-xs whitespace-nowrap text-secondary">
        {index}
      </span>
      <span className="flex flex-col gap-2">
        <span className="font-display text-xl font-heading">{title}</span>
        {detail === undefined ? null : (
          <span className={detailVariants({ density })}>{detail}</span>
        )}
      </span>
    </li>
  );
}
