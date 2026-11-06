import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const tradeVariants = cva(
  "grid grid-cols-1 gap-2 border-t border-border py-6 md:grid-cols-2 md:gap-8",
  {
    variants: {
      size: {
        md: "text-xl",
        lg: "text-2xl md:text-3xl",
      },
    },
    defaultVariants: { size: "lg" },
  },
);

interface TradeRowProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof tradeVariants> {
  /* What the visitor thinks they buy: struck through. */
  instead: string;
  /* What they actually get. */
  outcome: string;
}

/* A line of the exchange: the technology struck out, the result it buys written beside it. */
export function TradeRow({ instead, outcome, size, className, ...props }: TradeRowProps) {
  return (
    <div data-slot="trade-row" className={cn(tradeVariants({ size }), className)} {...props}>
      <dt className="font-display font-heading text-muted-foreground line-through decoration-rule decoration-2">
        {instead}
      </dt>
      <dd className="font-display font-heading text-foreground">{outcome}</dd>
    </div>
  );
}
