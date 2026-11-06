import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { Shuriken } from "../brand/shuriken.tsx";
import { cn } from "../lib/cn.ts";

const markVariants = cva("inline-block align-middle", {
  variants: {
    tone: {
      signal: "text-accent",
      cobalt: "text-secondary",
      ink: "text-foreground",
    },
  },
  defaultVariants: { tone: "signal" },
});

const eyebrowVariants = cva(
  "font-mono text-xs tracking-wide text-balance text-foreground uppercase",
  {
    variants: {
      /* The shuriken rides the first line, so a label that wraps keeps its mark beside its first words. */
      align: {
        start: "text-start",
        center: "text-center",
      },
    },
    defaultVariants: { align: "start" },
  },
);

interface EyebrowProps
  extends VariantProps<typeof markVariants>, VariantProps<typeof eyebrowVariants> {
  children: ReactNode;
  as?: "p" | "span" | "li";
  className?: string | undefined;
}

/* A section's label: the SHUNPO shuriken in a colour and a few words in mono capitals. */
export function Eyebrow({ children, tone, align, as: Element = "p", className }: EyebrowProps) {
  return (
    <Element data-slot="eyebrow" className={cn(eyebrowVariants({ align }), className)}>
      <Shuriken tone="glyph" size="xs" className={markVariants({ tone })} />
      {"\u2002"}
      {children}
    </Element>
  );
}
