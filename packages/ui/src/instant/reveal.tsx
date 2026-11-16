"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { lazy, type ReactNode, useState } from "react";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyRevealMotion = lazy(async () => {
  const { RevealMotion } = await import("./reveal-motion.tsx");
  return { default: RevealMotion };
});

const revealVariants = cva("", {
  variants: {
    mode: {
      /* Headings rise line by line from behind their own baseline. */
      lines: "",
      /* Each item is brushed in from the left, rule first. */
      sweep: "",
    },
  },
  defaultVariants: { mode: "lines" },
});

export type RevealMode = NonNullable<VariantProps<typeof revealVariants>["mode"]>;

interface RevealProps extends VariantProps<typeof revealVariants> {
  children: ReactNode;
  className?: string;
}

/* Plays an entrance on its content once the page is idle, and only for content the visitor has not seen yet
   (enterUnseen): the page is painted complete, and stays complete under reduced motion. */
export function Reveal({ children, mode, className }: RevealProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setRoot} data-slot="reveal" className={cn(revealVariants({ mode }), className)}>
      {children}
      <AfterIdle>
        <LazyRevealMotion root={root} mode={mode ?? "lines"} />
      </AfterIdle>
    </div>
  );
}
