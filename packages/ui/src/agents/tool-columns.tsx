import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

const columnsVariants = cva("grid grid-cols-3 gap-3 md:gap-4", {
  variants: {
    /* flat stands straight; tilted turns the wall a little in its own plane, still facing the reader. */
    lean: {
      flat: "",
      tilted: "agents-wall-tilt",
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
