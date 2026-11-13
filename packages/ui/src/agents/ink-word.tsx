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
  /* `own`: it plays its headline's entrance itself. `scene`: a scroll scene paints its focus and brackets
     (`data-ink-text`, `data-ink-bracket`), as the question scene does for its answer. */
  entrance?: "own" | "scene" | undefined;
  className?: string | undefined;
}

/* The word a headline is about, set between square brackets in Fushimi. Painted complete; once the page is idle, its
   headline's lines rise as it comes well inside the window, then the word comes into focus letter by letter and the
   brackets close on it from outside (`InkWordMotion`). A headline already in view plays the same entrance at once.
   Reduced motion keeps it painted. Inside a scroll scene (`entrance="scene"`) the scene paints that entrance instead. */
export function InkWord({ children, entrance = "own", className }: InkWordProps) {
  const [root, setRoot] = useState<HTMLSpanElement | null>(null);
  return (
    <span ref={setRoot} data-slot="ink-word" className={cn(inkWordVariants(), className)}>
      <span data-ink-text>{children}</span>
      <Bracket side="start" />
      <Bracket side="end" />
      {entrance === "own" ? (
        <AfterIdle>
          <LazyInkWordMotion root={root} />
        </AfterIdle>
      ) : null}
    </span>
  );
}
