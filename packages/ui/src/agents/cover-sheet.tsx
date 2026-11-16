import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { CoverSheetReveal } from "./cover-sheet-reveal.tsx";

const sheetVariants = cva("agents-cover-sheet relative z-10 bg-background shadow-agents-lift", {
  variants: {
    /* `washi`: the folds of a crumpled washi on the sheet and on its Shiro sections, their colours unchanged. */
    paper: {
      plain: "",
      washi: "agents-washi",
    },
  },
  defaultVariants: {
    paper: "plain",
  },
});

interface CoverSheetProps extends VariantProps<typeof sheetVariants> {
  children: ReactNode;
  className?: string | undefined;
}

/* The rest of the page, as one opaque sheet of its paper that rises over a held `HeroFilm`, lifted by a soft shadow
   cast upwards (as on the home page). */
export function CoverSheet({ children, paper, className }: CoverSheetProps) {
  return (
    <div data-slot="cover-sheet" className={cn(sheetVariants({ paper }), className)}>
      {children}
      <CoverSheetReveal />
    </div>
  );
}
