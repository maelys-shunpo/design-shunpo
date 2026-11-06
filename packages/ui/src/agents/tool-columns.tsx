import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

interface ToolColumnsProps {
  /* Three vertical Marquee columns. */
  children: ReactNode;
  className?: string;
}

/* The wall of tools: three columns side by side at every width, so the drift reads on a phone too. */
export function ToolColumns({ children, className }: ToolColumnsProps) {
  return (
    <div data-slot="tool-columns" className={cn("grid grid-cols-3 gap-3 md:gap-4", className)}>
      {children}
    </div>
  );
}
