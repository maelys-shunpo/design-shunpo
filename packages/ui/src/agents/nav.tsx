"use client";

import { cva } from "class-variance-authority";
import { type ReactNode, useEffect, useState } from "react";

/* Past this many pixels of scroll, the bar lifts off the page and floats as a pill. */
const FLOAT_AFTER = 24;

const barVariants = cva(
  "col-content flex items-center justify-between gap-6 rounded-2xl border py-3 transition-all duration-300 ease-emphasized",
  {
    variants: {
      /* Flat, the logo and the action sit on the first and last columns; floating, the pill keeps the content
         width and pads its own edges. */
      floating: {
        true: "border-border bg-surface px-4 md:px-6",
        false: "border-transparent bg-transparent px-0",
      },
    },
  },
);

interface AgentsNavProps {
  brand: ReactNode;
  /* The section links: shown from desktops. */
  links: ReactNode;
  action: ReactNode;
  label: string;
}

function useFloating(): boolean {
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    function read(): void {
      setFloating(window.scrollY > FLOAT_AFTER);
    }
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => {
      window.removeEventListener("scroll", read);
    };
  }, []);
  return floating;
}

/* The page's bar: flat over the hero, then a floating pill with a hairline once the visitor scrolls. */
export function AgentsNav({ brand, links, action, label }: AgentsNavProps) {
  const floating = useFloating();
  return (
    <header data-slot="agents-nav" className="sticky top-0 z-40 grid-page py-3">
      <nav aria-label={label} className={barVariants({ floating })}>
        {brand}
        <div className="hidden items-center gap-8 text-sm lg:flex">{links}</div>
        {action}
      </nav>
    </header>
  );
}
