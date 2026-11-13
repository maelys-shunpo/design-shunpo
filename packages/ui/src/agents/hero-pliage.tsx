"use client";

import { type ReactNode, useCallback, useRef } from "react";

import { GridArea } from "../layout/grid-area.tsx";
import { PageGrid } from "../layout/page-grid.tsx";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { pliageChoreography } from "./hero-pliage-choreography.ts";
import { PliageFigure, type PliageSheetSpec } from "./hero-pliage-figure.tsx";
import type { Paper } from "./hero-pliage-sheet.tsx";

/* A tool the team works in: its family, its mark and the paper its sheet is cut from. */
export interface PliageTool {
  id: string;
  label: string;
  icon: { path: string; title: string };
  paper: Paper;
}

interface HeroPliageProps {
  /* The eyebrow, the promise, its lead and its actions: they stay on screen while the sheets fold. */
  copy: ReactNode;
  /* Four tools, one per branch of the star, clockwise from the top. */
  tools: readonly PliageTool[];
  /* What the figure shows, read once in place of the drawing. */
  label: string;
  /* The line under the pebble: `before` while the sheets lie apart, `after` once they form the sign. The label
     reads the drawing, `after` included, once. */
  caption: { before: string; after: string };
}

/* Hero « Pliage »: the promise beside four sheets of paper, one per tool. As the visitor scrolls, each sheet
   folds into a kite, the kites gather into the SHUNPO star, the pebble slides under it and the star takes its
   instant step, a quarter turn. Phones and reduced motion show the folded sign. */
export function HeroPliage({ copy, tools, label, caption }: HeroPliageProps) {
  const scene = useRef<HTMLDivElement>(null);
  const choreography = useCallback((timeline: gsap.core.Timeline) => {
    if (scene.current !== null) {
      pliageChoreography(timeline, scene.current);
    }
  }, []);
  const sheets: PliageSheetSpec[] = tools.map((tool) => ({
    id: tool.id,
    label: tool.label,
    mark: { path: tool.icon.path },
    paper: tool.paper,
  }));

  return (
    <ScrollScene choreography={choreography} length="long" minWidth="md" below="header">
      <div
        ref={scene}
        data-slot="hero-pliage"
        className="grid w-full items-center md:motion-safe:h-full"
      >
        <PageGrid rows="lg" align="center">
          <GridArea columns={{ md: "all", lg: { start: 1, span: 6 } }}>{copy}</GridArea>
          <GridArea
            as="figure"
            columns={{ md: { start: 3, span: 4 }, lg: { start: 7, span: 6 } }}
            overflow="visible"
          >
            {/* The table the scroll folds, from tablets up with motion; the folded sign everywhere else. */}
            <PliageFigure
              sheets={sheets}
              moment="table"
              label={label}
              caption={caption}
              className="hidden md:motion-safe:block"
            />
            <PliageFigure
              sheets={sheets}
              moment="sign"
              label={label}
              caption={caption}
              className="md:motion-safe:hidden"
            />
          </GridArea>
        </PageGrid>
      </div>
    </ScrollScene>
  );
}
