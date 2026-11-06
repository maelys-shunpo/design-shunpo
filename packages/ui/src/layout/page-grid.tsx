import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const pageGridVariants = cva("grid-page", {
  variants: {
    /* The space between rows of areas: within a group, between groups, between distinct blocks. */
    rows: {
      none: "gap-y-0",
      sm: "gap-y-4 lg:gap-y-6",
      md: "gap-y-8 lg:gap-y-12",
      lg: "gap-y-10 md:gap-y-12 lg:gap-y-16",
      xl: "gap-y-12 md:gap-y-16 lg:gap-y-24",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: { rows: "md", align: "start" },
});

interface PageGridProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof pageGridVariants> {
  as?: "div" | "section" | "header" | "footer" | "ul" | "ol";
}

/* The page grid: 4, 8 or 12 content columns between two margins, at most 100rem wide. Place children with GridArea:
   centred, symmetric, asymmetric or full bleed. */
export function PageGrid({ rows, align, as: Element = "div", className, ...props }: PageGridProps) {
  return (
    <Element
      data-slot="page-grid"
      className={cn(pageGridVariants({ rows, align }), className)}
      {...props}
    />
  );
}
