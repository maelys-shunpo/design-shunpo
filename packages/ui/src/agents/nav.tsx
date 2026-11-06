"use client";

import { cva } from "class-variance-authority";
import { type ReactNode, useEffect, useState } from "react";

/* Past this many pixels of scroll, the bar lifts off the page and floats as a pill. */
const FLOAT_AFTER = 24;

const barVariants = cva(
  "mx-auto flex w-full items-center justify-between gap-6 rounded-2xl border px-4 py-3 transition-all duration-300 ease-emphasized md:px-6",
  {
    variants: {
      floating: {
        true: "max-w-default border-border bg-surface",
        false: "max-w-wide border-transparent bg-transparent",
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
    <header data-slot="agents-nav" className="sticky top-0 z-40 p-3">
      <nav aria-label={label} className={barVariants({ floating })}>
        {brand}
        <div className="hidden items-center gap-8 text-sm lg:flex">{links}</div>
        {action}
      </nav>
    </header>
  );
}
