"use client";

import { type ReactNode, useRef } from "react";

import { ScrollScene } from "../motion/scroll-scene.tsx";

interface PanSceneProps {
  /* The copy that opens the scene, on the left: it leaves to the left as the piece arrives. */
  lead: ReactNode;
  /* The piece that comes in from the right and ends centred on the stage: an interface on its surface. */
  children: ReactNode;
  /* How many windows of scroll the stage is held for. */
  length?: number;
}

/* A section that travels sideways with the scroll: held under the floating header from tablets up, its lead and its
   piece sit on one row wider than the window, and the scroll slides that row until the piece fills the stage, centred.
   The piece shows at the window's right edge from the start, so the visitor sees what is coming. Stacked, with no
   travel, on phones and under reduced motion. */
export function PanScene({ lead, children, length = 1.5 }: PanSceneProps) {
  const row = useRef<HTMLDivElement>(null);
  return (
    <ScrollScene
      minWidth="md"
      below="header"
      length={length}
      choreography={(timeline) => {
        const node = row.current;
        if (node === null) {
          return;
        }
        timeline.fromTo(
          node,
          { x: 0 },
          {
            x: () => -(node.scrollWidth - node.clientWidth),
            ease: "none",
            duration: 1,
            invalidateOnRefresh: true,
          },
        );
      }}
    >
      <div
        ref={row}
        data-slot="pan-scene-row"
        className="flex w-full flex-col gap-12 md:motion-safe:flex-row md:motion-safe:items-center md:motion-safe:gap-0"
      >
        <div className="px-page md:motion-safe:w-3/5 md:motion-safe:shrink-0">{lead}</div>
        <div className="px-page md:motion-safe:w-full md:motion-safe:shrink-0">{children}</div>
      </div>
    </ScrollScene>
  );
}
