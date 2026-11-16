"use client";

import { lazy, useState } from "react";

import { AfterIdle } from "../motion/after-idle.tsx";

const LazyPaperSheenMotion = lazy(async () => {
  const { PaperSheenMotion } = await import("./paper-sheen-motion.tsx");
  return { default: PaperSheenMotion };
});

/* A soft light that follows the pointer across the paper, a beat behind. Drop it as the first child of a relative cut
   surface (an `agents-sheet`): it reads the surface for the pointer and lights the paper under the content, clipped to
   the same bias cut. No scale, no tilt. Mouse only; a finger and reduced motion leave the paper plain. */
export function PaperSheen() {
  const [layer, setLayer] = useState<HTMLSpanElement | null>(null);
  return (
    <>
      <span aria-hidden data-slot="paper-sheen" ref={setLayer} className="agents-sheen" />
      <AfterIdle>
        <LazyPaperSheenMotion layer={layer} />
      </AfterIdle>
    </>
  );
}
