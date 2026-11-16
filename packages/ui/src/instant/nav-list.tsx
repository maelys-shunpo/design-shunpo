import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

interface NavListProps {
  children: ReactNode;
  className?: string;
}

/* The section anchors of the masthead, spaced like entries of a table of contents. */
export function NavList({ children, className }: NavListProps) {
  return (
    <ul data-slot="nav-list" className={cn("flex items-center gap-8", className)}>
      {children}
    </ul>
  );
}
