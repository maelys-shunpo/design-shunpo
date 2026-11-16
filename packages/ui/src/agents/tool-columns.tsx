import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const columnsVariants = cva("grid grid-cols-3 gap-3 md:gap-4", {
  variants: {
    /* flat aligns the columns; staggered sets them at different heights, the middle one lowest. */
    lean: {
      flat: "",
      staggered: "agents-wall-stagger",
    },
  },
  defaultVariants: { lean: "flat" },
});

interface ToolColumnsProps extends VariantProps<typeof columnsVariants> {
  /* Three vertical Marquee columns. */
  children: ReactNode;
  className?: string;
}

/* The wall of tools: three columns side by side at every width, so the drift reads on a phone too. */
export function ToolColumns({ children, lean, className }: ToolColumnsProps) {
  return (
    <div data-slot="tool-columns" className={cn(columnsVariants({ lean }), className)}>
      {children}
    </div>
  );
}
