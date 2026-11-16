import { cva, type VariantProps } from "class-variance-authority";

import { ShunpoLogo } from "../brand/shunpo-logo.tsx";
import { cn } from "../lib/cn.ts";

const wordmarkVariants = cva("inline-flex text-foreground", {
  variants: {
    size: {
      md: "",
      lg: "",
    },
  },
  defaultVariants: { size: "md" },
});

const logoSize = { md: "md", lg: "lg" } as const;

interface WordmarkProps extends VariantProps<typeof wordmarkVariants> {
  className?: string | undefined;
}

/* The « Agents » wordmark: the official SHUNPO logo, in the ink of the page. */
export function Wordmark({ size, className }: WordmarkProps) {
  return (
    <span data-slot="wordmark" className={cn(wordmarkVariants({ size }), className)}>
      <ShunpoLogo size={logoSize[size ?? "md"]} />
    </span>
  );
}
