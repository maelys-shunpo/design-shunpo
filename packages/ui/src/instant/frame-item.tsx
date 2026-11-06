import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

/* One item a FrameList can designate. */
export function FrameItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <li data-frame-item data-slot="frame-item" className={cn("relative py-12 lg:px-8", className)}>
      {children}
    </li>
  );
}
