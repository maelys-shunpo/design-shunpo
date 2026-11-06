import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

const wordmarkVariants = cva(
  "inline-flex items-center gap-2 font-sans font-medium tracking-normal text-foreground",
  {
    variants: {
      size: {
        md: "text-xl",
        lg: "text-3xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const markVariants = cva("relative inline-block shrink-0 bg-accent", {
  variants: {
    size: {
      md: "size-3",
      lg: "size-5",
    },
  },
  defaultVariants: { size: "md" },
});

interface WordmarkProps extends VariantProps<typeof wordmarkVariants> {
  className?: string | undefined;
}

/* The « Agents » wordmark: the name set in lowercase beside a signal square, the cursor of an agent at work. */
export function Wordmark({ size, className }: WordmarkProps) {
  return (
    <span data-slot="wordmark" className={cn(wordmarkVariants({ size }), className)}>
      <span aria-hidden className={markVariants({ size })} />
      shunpo
    </span>
  );
}
