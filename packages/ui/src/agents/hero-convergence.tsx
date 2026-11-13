"use client";

import { type ReactNode, useCallback, useRef } from "react";

import { ScrollScene } from "../motion/scroll-scene.tsx";
import { convergeChoreography } from "./hero-convergence-choreography.ts";
import { type GlimpseField, type GlimpsePlace, ToolGlimpse } from "./hero-convergence-glimpse.tsx";
import {
  ConvergeWorkspace,
  type WorkspaceFrame,
  type WorkspaceTask,
} from "./hero-convergence-workspace.tsx";

/* A tool the team works in: the window it shows today, and the row it becomes in the workspace. */
export interface ConvergeTool extends WorkspaceTask {
  app: string;
  context: string;
  title: string;
  detail: string;
  fields: readonly GlimpseField[];
}

/* On wide screens the windows lie in the side margins, top to bottom in the order of the rows they land on (left,
   right, left…), so no two flights cross; some run past the stage's edge, the way windows pile up on a desk. On
   tablets, four of them sit above and below the copy. */
const PLACES: readonly GlimpsePlace[] = [
  { wide: { x: 0.11, y: 0.17 }, narrow: { x: 0.22, y: 0.11 }, turn: -5, depth: 1 },
  { wide: { x: 0.89, y: 0.14 }, narrow: { x: 0.78, y: 0.1 }, turn: 4, depth: 0.9 },
  { wide: { x: 0.11, y: 0.53 }, turn: 3, depth: 1.06 },
  { wide: { x: 0.89, y: 0.5 }, turn: -4, depth: 1 },
  { wide: { x: 0.14, y: 0.88 }, narrow: { x: 0.24, y: 0.89 }, turn: -2, depth: 0.88 },
  { wide: { x: 0.86, y: 0.86 }, narrow: { x: 0.77, y: 0.9 }, turn: 5, depth: 0.94 },
];
const FALLBACK_PLACE: GlimpsePlace = { wide: { x: 0.5, y: 1.1 }, turn: 0, depth: 0.8 };

interface HeroConvergenceProps {
  /* The eyebrow, the promise, its lead and its actions. */
  copy: ReactNode;
  workspace: WorkspaceFrame;
  /* Six tools read best: one per place around the promise. */
  tools: readonly ConvergeTool[];
  /* The closing line under the workspace once it has formed: the message back, as a heading. */
  caption: ReactNode;
}

/* Signature « Convergence »: the promise surrounded by the windows of the tools a team juggles today. As the
   visitor scrolls, each window flies into its own row of one SHUNPO workspace, then the agent's work turns every
   status. Phones and reduced motion read the copy, then the gathered workspace. */
export function HeroConvergence({ copy, workspace, tools, caption }: HeroConvergenceProps) {
  const scene = useRef<HTMLDivElement>(null);
  const choreography = useCallback((timeline: gsap.core.Timeline) => {
    if (scene.current !== null) {
      convergeChoreography(timeline, scene.current);
    }
  }, []);

  return (
    <ScrollScene choreography={choreography} length="medium" minWidth="md" below="header">
      <div
        ref={scene}
        data-slot="hero-convergence"
        className="relative grid w-full grid-cols-1 place-items-center gap-8 md:motion-safe:h-full"
      >
        <ul
          aria-hidden
          data-converge="glimpses"
          className="pointer-events-none absolute inset-0 z-20 hidden md:motion-safe:block"
        >
          {tools.map((tool, index) => (
            <ToolGlimpse key={tool.id} {...tool} place={PLACES[index] ?? FALLBACK_PLACE} />
          ))}
        </ul>
        <div
          data-converge="copy"
          className="relative z-10 w-full max-w-narrow px-5 md:px-8 md:motion-safe:col-start-1 md:motion-safe:row-start-1"
        >
          {copy}
        </div>
        <div className="flex w-full max-w-narrow flex-col items-center gap-6 px-5 md:px-8 md:motion-safe:col-start-1 md:motion-safe:row-start-1">
          <div data-converge="workspace" className="w-full md:motion-safe:opacity-0">
            <ConvergeWorkspace frame={workspace} tasks={tools} />
          </div>
          <div data-converge="caption" className="md:motion-safe:opacity-0">
            {caption}
          </div>
        </div>
      </div>
    </ScrollScene>
  );
}
