import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const defectVariants = cva(
  "group grid grid-cols-1 gap-3 border-t border-border py-8 md:grid-cols-12 md:gap-6",
  {
    variants: {
      emphasis: {
        none: "",
        hover: "transition-colors duration-200 hover:border-rule",
      },
    },
    defaultVariants: { emphasis: "hover" },
  },
);

interface DefectRowProps
  extends Omit<HTMLAttributes<HTMLLIElement>, "title">, VariantProps<typeof defectVariants> {
  index: string;
  title: string;
  detail: string;
}

/* A line of the inspection report: the defect found, numbered, and what it costs the team. */
export function DefectRow({ index, title, detail, emphasis, className, ...props }: DefectRowProps) {
  return (
    <li data-slot="defect-row" className={cn(defectVariants({ emphasis }), className)} {...props}>
      <span className="font-mono text-xs text-muted-foreground transition-colors duration-200 group-hover:text-secondary md:col-span-2">
        {index}
      </span>
      <span className="font-display text-2xl font-heading md:col-span-5">{title}</span>
      <span className="text-md text-muted-foreground md:col-span-5">{detail}</span>
    </li>
  );
}
