import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const wordmarkVariants = cva("font-display leading-none font-regular italic", {
  variants: {
    size: {
      sm: "text-2xl",
      xl: "text-8xl",
    },
  },
  defaultVariants: { size: "sm" },
});

interface WordmarkProps extends VariantProps<typeof wordmarkVariants> {
  className?: string;
}

/* The name set in the direction's display italic, a fold of citron through its first letter. */
export function Wordmark({ size, className }: WordmarkProps) {
  return (
    <span data-slot="origami-wordmark" className={cn(wordmarkVariants({ size }), className)}>
      <span className="text-accent">S</span>hunpo
    </span>
  );
}
