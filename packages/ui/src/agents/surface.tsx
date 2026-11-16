import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";

const surfaceVariants = cva("agents-sheet", {
  variants: {
    paper: {
      paper: "agents-sheet-paper",
      wait: "agents-sheet-wait",
      ok: "agents-sheet-ok",
      info: "agents-sheet-info",
      night: "agents-sheet-night",
    },
    cut: {
      base: "",
      xs: "agents-sheet-xs",
      sm: "agents-sheet-sm",
      md: "agents-sheet-md",
      lg: "agents-sheet-lg",
      xl: "agents-sheet-xl",
    },
    shadow: {
      none: "",
      lift: "agents-sheet-lift",
      float: "agents-sheet-float",
    },
    pad: {
      none: "",
      sm: "p-6",
      md: "p-8",
      lg: "p-12",
    },
  },
  defaultVariants: { paper: "paper", cut: "base", shadow: "none", pad: "none" },
});

interface SurfaceProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof surfaceVariants> {}

/* A cut paper panel that carries content: the design system's general « sheet laid on the page ». One 45° cut at the
   top right (`cut`), a paper fill (`paper`) and an optional drop shadow that follows the cut (`shadow`). */
export function Surface({ paper, cut, shadow, pad, className, children, ...props }: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      className={cn(surfaceVariants({ paper, cut, shadow, pad }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
