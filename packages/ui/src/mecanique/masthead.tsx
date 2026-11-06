import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const mastheadVariants = cva("border-b border-border", {
  variants: {
    tone: {
      plain: "",
      raised: "bg-surface",
    },
  },
  defaultVariants: { tone: "plain" },
});

interface MastheadProps extends VariantProps<typeof mastheadVariants> {
  className?: string;
  brand: ReactNode;
  /* The page's anchors, as a list of links. */
  navigation: ReactNode;
  action: ReactNode;
  /* Names the navigation landmark. */
  label: string;
}

/* The title block of the drawing: brand, anchors and action on one hairline-ruled band. */
export function Masthead({ brand, navigation, action, label, tone, className }: MastheadProps) {
  return (
    <header data-slot="masthead" className={cn(mastheadVariants({ tone }), className)}>
      <div className="mx-auto grid h-16 w-full max-w-wide grid-cols-2 items-center gap-6 px-5 md:px-8 lg:grid-cols-3 lg:px-10">
        <div className="flex items-center">{brand}</div>
        <nav aria-label={label} className="hidden justify-center lg:flex">
          <ul className="flex items-center gap-8">{navigation}</ul>
        </nav>
        <div className="flex justify-end">{action}</div>
      </div>
    </header>
  );
}
