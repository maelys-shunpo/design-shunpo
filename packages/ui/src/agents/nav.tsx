"use client";

import { cva } from "class-variance-authority";
import { type ReactNode, useEffect, useState } from "react";

/* Past this many pixels of scroll, the bar lifts off the page and floats as a cut sheet. */
const FLOAT_AFTER = 24;

/* Over the paper, the bar takes its place at the top of the page; over a hero film, it lies on the film, out of the
   flow, so the film fills the window from its top edge. */
const headerVariants = cva("top-0 z-40 grid-page py-3", {
  variants: {
    over: {
      paper: "sticky",
      film: "fixed inset-x-0",
    },
  },
});

const barVariants = cva(
  "agents-sheet col-content flex items-center justify-between gap-6 py-3 text-foreground transition-all duration-300 ease-emphasized agents-sheet-md before:transition-opacity before:duration-300 after:transition-opacity after:duration-300",
  {
    variants: {
      /* Flat, the logo and the action sit on the first and last columns, no sheet under them; floating, the sheet
         shows, cut 14 px, keeps the content width and pads its own edges. */
      floating: {
        true: "px-4 agents-sheet-float before:opacity-100 after:opacity-100 md:px-6",
        false: "px-0 before:opacity-0 after:opacity-0",
      },
      over: {
        paper: "",
        film: "",
      },
    },
    /* Flat on a film's night, the bar reads in Kome; floating, the sheet is paper again. */
    compoundVariants: [{ floating: false, over: "film", className: "scheme-dark" }],
  },
);

interface AgentsNavProps {
  brand: ReactNode;
  /* The section links: shown from desktops. */
  links: ReactNode;
  action: ReactNode;
  label: string;
  /* What the bar lies over at the top of the page: the paper, or a hero film (`HeroFilm`). */
  over?: "paper" | "film";
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

/* The page's bar: flat over the hero, then a floating sheet cut 14 px with a hairline once the visitor scrolls. */
export function AgentsNav({ brand, links, action, label, over = "paper" }: AgentsNavProps) {
  const floating = useFloating();
  return (
    <header data-slot="agents-nav" className={headerVariants({ over })}>
      <nav aria-label={label} className={barVariants({ floating, over })}>
        {brand}
        <div className="hidden items-center gap-8 text-sm lg:flex">{links}</div>
        {action}
      </nav>
    </header>
  );
}
