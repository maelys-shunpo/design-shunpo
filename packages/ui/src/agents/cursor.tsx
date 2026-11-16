"use client";

import { lazy, useState } from "react";

import { AfterIdle } from "../motion/after-idle.tsx";
import type { CursorForm, CursorTravel } from "./cursor-model.ts";

const LazyCursorMotion = lazy(async () => {
  const { CursorMotion } = await import("./cursor-motion.tsx");
  return { default: CursorMotion };
});

interface CursorProps {
  /* The point's form: **coupe** (the direction's hard cut square that jumps to designate) or satin (a round dot and a
     ring that trail the pointer with a soft lag and hug what they designate, the Framer-smooth reading). */
  form?: CursorForm;
  /* How the frame reaches a new target when the form jumps: **shift** leaves ghosts (Shunpo Shift), glide slides with
     none. Satin always glides. */
  travel?: CursorTravel;
}

/* The page's own cursor (DA « Immobile, puis instantané »). Render it once near the root of a page: a point follows the
   pointer and a two-corner frame (coupe) or a hugging outline (satin) designates. It reads each element's `data-cursor`
   (`point`, `hide`, `shrink`, `designate`, `scrub`, `native`), falling back to a sensible default, and takes its colour
   from the island under it (Kome on `data-scheme="dark"`). It draws nothing until its motion module is live, so touch,
   reduced motion and a dropped chunk all keep the system cursor. */
export function Cursor({ form = "coupe", travel = "shift" }: CursorProps) {
  const [dot, setDot] = useState<HTMLSpanElement | null>(null);
  const [ring, setRing] = useState<HTMLSpanElement | null>(null);
  const [frame, setFrame] = useState<HTMLSpanElement | null>(null);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setLayer}
      aria-hidden
      data-slot="agents-cursor"
      data-form={form}
      className="agents-cursor"
    >
      <span ref={setRing} data-cursor-ring />
      <span ref={setDot} data-slot="agents-cursor-dot" />
      <span ref={setFrame} data-cursor-frame className="agents-frame-travel" />
      <AfterIdle>
        <LazyCursorMotion
          layer={layer}
          dot={dot}
          ring={ring}
          frame={frame}
          form={form}
          travel={travel}
        />
      </AfterIdle>
    </div>
  );
}
