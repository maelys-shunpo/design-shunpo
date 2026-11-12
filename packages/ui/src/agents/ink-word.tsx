"use client";

import { cva } from "class-variance-authority";
import { lazy, type ReactNode, useState } from "react";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyInkWordMotion = lazy(async () => {
  const { InkWordMotion } = await import("./ink-word-motion.tsx");
  return { default: InkWordMotion };
});

const inkWordVariants = cva("agents-ink-word");

/* « [ » or « ] »: a full-height upright with a short leg at its top and at its foot, turned toward the word. */
function Bracket({ side }: { side: "start" | "end" }) {
  return (
    <span aria-hidden="true" data-ink-bracket data-side={side} className="agents-ink-bracket" />
  );
}

interface InkWordProps {
  /* The word, in the headline's own type. */
  children: ReactNode;
  className?: string;
}

/* The word a headline is about, set between square brackets in Fushimi. Painted complete; once the page is idle, its
   headline's lines rise as it comes well inside the window, then the word comes into focus letter by letter and the
   brackets close on it from outside (`InkWordMotion`). A headline already in view plays the same entrance at once.
   Reduced motion keeps it painted. */
export function InkWord({ children, className }: InkWordProps) {
  const [root, setRoot] = useState<HTMLSpanElement | null>(null);
  return (
    <span ref={setRoot} data-slot="ink-word" className={cn(inkWordVariants(), className)}>
      <span data-ink-text>{children}</span>
      <Bracket side="start" />
      <Bracket side="end" />
      <AfterIdle>
        <LazyInkWordMotion root={root} />
      </AfterIdle>
    </span>
  );
}
