import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { Shuriken } from "../brand/shuriken.tsx";
import { cn } from "../lib/cn.ts";

const markVariants = cva("", {
  variants: {
    tone: {
      signal: "text-accent",
      cobalt: "text-secondary",
      ink: "text-foreground",
    },
  },
  defaultVariants: { tone: "signal" },
});

interface EyebrowProps extends VariantProps<typeof markVariants> {
  children: ReactNode;
  as?: "p" | "span" | "li";
  className?: string | undefined;
}

/* A section's label: the SHUNPO shuriken in a colour and a few words in mono capitals. */
export function Eyebrow({ children, tone, as: Element = "p", className }: EyebrowProps) {
  return (
    <Element
      data-slot="eyebrow"
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs tracking-wide text-foreground uppercase",
        className,
      )}
    >
      <Shuriken tone="glyph" size="xs" className={markVariants({ tone })} />
      {children}
    </Element>
  );
}
