"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { useState } from "react";

import { cn } from "../lib/cn.ts";
import { useArrival } from "./use-arrival.ts";

/* How the wrapped content settles once it is seen. `follow`: a short rise (12 px) on a delay, so phrase and call settle
   just after the title above them has landed, as one entrance in two beats. `block`: a whole block (a card, a list)
   rises once (16 px) without a delay, as it comes into view. Both wait off screen until a third of them shows, and are
   painted in place under reduced motion. */
const arrivalVariants = cva("", {
  variants: {
    mode: {
      follow: "agents-follow",
      block: "agents-arrive-block",
    },
  },
  defaultVariants: { mode: "follow" },
});

interface ArrivalProps extends VariantProps<typeof arrivalVariants> {
  children: ReactNode;
  className?: string | undefined;
}

/* Wraps content that arrives after the visitor reaches it. It composes `useArrival`: its `data-arrival` drives the CSS
   entrance (`agents-follow`, `agents-arrive-block`). Content already in view is reported arrived at once, so it stays as
   painted instead of replaying under the reader's eyes. */
export function Arrival({ mode, children, className }: ArrivalProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const arrived = useArrival(root);
  return (
    <div
      ref={setRoot}
      data-slot="arrival"
      data-arrival={arrived ? "arrived" : "waiting"}
      className={cn(arrivalVariants({ mode }), className)}
    >
      {children}
    </div>
  );
}
