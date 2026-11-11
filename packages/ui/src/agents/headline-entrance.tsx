"use client";

import { lazy, useState } from "react";

import { AfterIdle } from "../motion/after-idle.tsx";

const LazyHeadlineMotion = lazy(async () => {
  const { HeadlineMotion } = await import("./headline-motion.tsx");
  return { default: HeadlineMotion };
});

/* One entrance per title role: `lines` for section titles, `letters` for the closing call, `throw` for one-line page
   titles. */
export type HeadlineEntranceKind = "lines" | "letters" | "throw";

interface HeadlineEntranceProps {
  kind: HeadlineEntranceKind;
}

/* The hidden anchor a `Headline` with an entrance renders right after itself: once the page is idle it loads the
   motion module, which plays the entrance on the headline standing just before the anchor. */
export function HeadlineEntrance({ kind }: HeadlineEntranceProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <span hidden ref={setAnchor} data-slot="headline-entrance">
      <AfterIdle>
        <LazyHeadlineMotion anchor={anchor} kind={kind} />
      </AfterIdle>
    </span>
  );
}
