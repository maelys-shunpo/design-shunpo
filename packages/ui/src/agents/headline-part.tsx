import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const partVariants = cva("", {
  variants: {
    tone: {
      /* Context: the grey that lets the important words stand. */
      dim: "text-agents-dim",
      ink: "text-foreground",
      /* One word set in the italic serif, the human note in a machine sentence. */
      serif: "font-serif font-regular tracking-normal text-foreground italic",
    },
    block: {
      true: "block",
      false: "",
    },
  },
  defaultVariants: { tone: "ink", block: false },
});

interface HeadlinePartProps extends VariantProps<typeof partVariants> {
  children: ReactNode;
  className?: string | undefined;
}

export function HeadlinePart({ children, tone, block, className }: HeadlinePartProps) {
  return (
    <span data-slot="headline-part" className={cn(partVariants({ tone, block }), className)}>
      {children}
    </span>
  );
}
