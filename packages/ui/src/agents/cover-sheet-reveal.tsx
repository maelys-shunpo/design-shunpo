"use client";

import { lazy } from "react";

import { AfterIdle } from "../motion/after-idle.tsx";

const LazyCoverSheetMotion = lazy(async () => {
  const { CoverSheetMotion } = await import("./cover-sheet-motion.tsx");
  return { default: CoverSheetMotion };
});

/* Loads the sheet's reveal motion once the page is idle, off the first paint (GSAP never on the critical path). */
export function CoverSheetReveal() {
  return (
    <AfterIdle>
      <LazyCoverSheetMotion />
    </AfterIdle>
  );
}
