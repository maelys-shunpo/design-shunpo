"use client";

import { type ReactElement, type ReactNode, useMemo, useState } from "react";

import { GridArea } from "../layout/grid-area.tsx";
import { PageGrid } from "../layout/page-grid.tsx";
import { AgentsShurikenStage } from "../motion/agents-shuriken-stage.tsx";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import type { ShurikenMark } from "../scene/agents-shuriken-world.ts";
import { shurikenChoreography } from "./hero-shuriken-choreography.ts";

interface HeroShurikenProps {
  /* The promise: label, headline, lead and actions. It stays in place while the sign folds beside it. */
  copy: ReactNode;
  /* The scene's first frame, the four sheets laid on the paper (next/image): the stage's accessible name. */
  poster: ReactElement;
  /* The sign folded on its pebble, seen from above: phones and reduced motion show it instead of the scene. */
  folded: ReactElement;
  /* The four tools printed on the sheets, from the top point of the sign clockwise. */
  marks: readonly ShurikenMark[];
  /* The line under the sign, before and after the points lock: « 4 outils… », then « 1 système… ». */
  caption: { before: string; after: string };
}

/* The caption under the sign: the first line in the flow, the second laid over it, out of the flow, until the
   points lock. Phones and reduced motion read the second only. */
function Caption({ caption }: { caption: HeroShurikenProps["caption"] }) {
  return (
    <p className="relative text-center font-mono text-xs tracking-wide text-muted-foreground uppercase">
      <span data-shuriken-caption="before" className="invisible md:motion-safe:visible">
        {caption.before}
      </span>
      <span
        data-shuriken-caption="after"
        className="absolute inset-0 whitespace-nowrap md:motion-safe:invisible"
      >
        {caption.after}
      </span>
    </p>
  );
}

/* Hero « Le signe plié »: the promise on the first five columns, and beside it four sheets of paper, one per
   tool, that fold into points and lock into the SHUNPO sign on its Fushimi pebble, held over three screens from
   tablets up. Phones and reduced motion show the folded sign. */
export function HeroShuriken({ copy, poster, folded, marks, caption }: HeroShurikenProps) {
  const [progress] = useState(() => ({ value: 0 }));
  /* The timeline is built once the page is idle, after this section has mounted: it finds its captions here. */
  const [scope, setScope] = useState<HTMLElement | null>(null);
  const choreography = useMemo(() => shurikenChoreography(progress, scope), [progress, scope]);
  return (
    <section ref={setScope} data-slot="hero-shuriken" className="overflow-clip">
      <ScrollScene choreography={choreography} length="long" minWidth="md" below="header">
        <PageGrid rows="md" align="center" className="w-full">
          <GridArea columns={{ md: "all", lg: { start: 1, span: 5 } }} overflow="visible">
            {copy}
          </GridArea>
          <GridArea columns={{ md: 6, lg: { start: 6, span: 7 } }}>
            <figure className="grid justify-items-center gap-4">
              <div className="agents-shuriken-frame">
                <div className="hidden md:motion-safe:block">
                  <AgentsShurikenStage poster={poster} progress={progress} marks={marks} />
                </div>
                <div className="md:motion-safe:hidden">{folded}</div>
              </div>
              <figcaption>
                <Caption caption={caption} />
              </figcaption>
            </figure>
          </GridArea>
        </PageGrid>
      </ScrollScene>
    </section>
  );
}
