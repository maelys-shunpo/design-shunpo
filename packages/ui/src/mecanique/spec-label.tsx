import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const specLabelVariants = cva(
  "inline-flex items-center gap-3 font-mono text-xs font-medium tracking-wider uppercase",
  {
    variants: {
      tone: {
        muted: "text-muted-foreground",
        default: "text-foreground",
        signal: "text-secondary",
      },
      rule: {
        true: "before:block before:h-px before:w-8 before:bg-current",
        false: "",
      },
    },
    defaultVariants: { tone: "muted", rule: false },
  },
);

interface SpecLabelProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof specLabelVariants> {
  as?: "span" | "p" | "dt" | "figcaption" | "li";
}

/* A drawing's annotation: reference, operation number, tolerance. Mono capitals, read as a label, never as prose. */
export function SpecLabel({
  as: Element = "span",
  tone,
  rule,
  className,
  ...props
}: SpecLabelProps) {
  return (
    <Element
      data-slot="spec-label"
      className={cn(specLabelVariants({ tone, rule }), className)}
      {...props}
    />
  );
}
