import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const eyebrowVariants = cva("text-sm font-medium text-balance text-muted-foreground", {
  variants: {
    align: {
      start: "text-start",
      center: "text-center",
    },
  },
  defaultVariants: { align: "start" },
});

interface EyebrowProps extends VariantProps<typeof eyebrowVariants> {
  children: ReactNode;
  as?: "p" | "span" | "li";
  className?: string | undefined;
}

/* A few plain words above a title, only when they say what the title does not (« Agents IA sur mesure » above a hero
   promise). Text face, medium, sentence case: no symbol, no capitals, no monospace. */
export function Eyebrow({ children, align, as: Element = "p", className }: EyebrowProps) {
  return (
    <Element data-slot="eyebrow" className={cn(eyebrowVariants({ align }), className)}>
      {children}
    </Element>
  );
}
