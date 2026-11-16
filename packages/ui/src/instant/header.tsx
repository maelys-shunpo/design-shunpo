import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

interface InstantHeaderProps {
  /* The home link, carrying the wordmark. */
  brand: ReactNode;
  /* Anchors to the page's sections: shown from the large breakpoint, where they fit on one line. */
  navigation: ReactNode;
  action: ReactNode;
  className?: string;
}

/* The masthead of a printed page: the mark on the left margin, the contents in the middle, the action on the right,
   over a hairline. */
export function InstantHeader({ brand, navigation, action, className }: InstantHeaderProps) {
  return (
    <header
      data-slot="instant-header"
      className={cn(
        "relative z-20 flex items-center justify-between gap-6 border-b border-border px-6 py-4 md:px-12 lg:grid lg:grid-cols-3 lg:px-20",
        className,
      )}
    >
      <div className="flex">{brand}</div>
      <nav aria-label="Sections" className="hidden justify-center lg:flex">
        {navigation}
      </nav>
      <div className="flex justify-end">{action}</div>
    </header>
  );
}
