import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const squareVariants = cva("size-2 shrink-0", {
  variants: {
    tone: {
      signal: "bg-accent",
      cobalt: "bg-secondary",
      ink: "bg-foreground",
    },
  },
  defaultVariants: { tone: "signal" },
});

interface EyebrowProps extends VariantProps<typeof squareVariants> {
  children: ReactNode;
  as?: "p" | "span" | "li";
  className?: string | undefined;
}

/* A section's label: a coloured square and a few words in mono capitals, the way a product names its modules. */
export function Eyebrow({ children, tone, as: Element = "p", className }: EyebrowProps) {
  return (
    <Element
      data-slot="eyebrow"
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs tracking-wide text-foreground uppercase",
        className,
      )}
    >
      <span aria-hidden className={squareVariants({ tone })} />
      {children}
    </Element>
  );
}
