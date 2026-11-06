import type { ReactNode } from "react";

interface OrigamiHeaderProps {
  brand: ReactNode;
  /* Anchor links, shown from the large breakpoint. */
  navigation: ReactNode;
  action: ReactNode;
}

/* The header laid over the studio: the wordmark, a few anchors in mono, the action. */
export function OrigamiHeader({ brand, navigation, action }: OrigamiHeaderProps) {
  return (
    <header
      data-slot="origami-header"
      className="relative z-10 flex items-center justify-between gap-6 p-6 md:px-12 lg:px-20"
    >
      {brand}
      <nav aria-label="Sections" className="hidden lg:block">
        {navigation}
      </nav>
      {action}
    </header>
  );
}
