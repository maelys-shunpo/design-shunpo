import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn.ts";

/* The hanko: a square of red ink, its border carved out, the kanji 瞬 left in paper. Decorative: it signs a plate. */
const sealVariants = cva(
  "relative inline-grid shrink-0 place-items-center bg-accent text-accent-foreground",
  {
    variants: {
      size: {
        sm: "size-12 p-1",
        md: "size-24 p-2",
        lg: "size-48 p-3",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const glyphVariants = cva("font-display leading-none font-semibold", {
  variants: {
    size: {
      sm: "text-2xl",
      md: "text-5xl",
      lg: "text-7xl",
    },
  },
  defaultVariants: { size: "md" },
});

interface SealMarkProps extends VariantProps<typeof sealVariants> {
  className?: string;
}

export function SealMark({ size, className }: SealMarkProps) {
  return (
    <span data-slot="seal-mark" aria-hidden className={cn(sealVariants({ size }), className)}>
      <span className="grid size-full place-items-center border-2 border-accent-foreground">
        <span className={glyphVariants({ size })}>瞬</span>
      </span>
    </span>
  );
}
