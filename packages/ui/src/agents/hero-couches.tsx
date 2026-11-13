"use client";

import type { ReactElement, ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";

import { cn } from "../lib/cn.ts";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { Eyebrow } from "./eyebrow.tsx";
import { couchesPoster, explodeLayers } from "./hero-couches-choreography.ts";
import {
  AgentsPlane,
  type CouchesAgent,
  type CouchesWorkspace,
  ToolsPlane,
  WorkspacePlane,
} from "./hero-couches-layers.tsx";

declare module "react" {
  interface CSSProperties {
    /* HeroCouches: a thread's column, and the poster's drop and tilt. */
    "--couches-x"?: string;
    "--couches-y"?: string;
    "--couches-tilt"?: string;
    "--couches-y-wide"?: string;
    "--couches-scale"?: string;
    "--couches-label-y"?: string;
  }
}

/* What a layer is, beside it: its number, a short title and one line. */
interface CouchesLabel {
  index: string;
  title: string;
  detail: string;
}

interface CouchesLabels {
  you: CouchesLabel;
  agents: CouchesLabel;
  tools: CouchesLabel;
}

interface HeroCouchesProps {
  /* The promise: label, headline, lead and actions, composed by the page. */
  copy: ReactNode;
  /* A next/image with `fill`: the plaster slab the stack rests on. Decorative. */
  backdrop: ReactElement;
  labels: CouchesLabels;
  workspace: CouchesWorkspace;
  /* Three agents, one above each column of tools. */
  agents: readonly CouchesAgent[];
  tools: ReadonlyArray<readonly SimpleIcon[]>;
  /* The tool the routed task lands in (a simple-icons slug). */
  target: string;
  /* A closing line and action under the finished interface, composed by the page. */
  outro?: ReactNode;
  className?: string | undefined;
}

/* Each label's height beside the exploded stack, as a share of the stage. */
const labelHeights = { you: "28%", agents: "50%", tools: "72%" } as const;
/* The threads drop through each agent onto the second tool of its column (the one the routed task lands in). */
const threadColumns = ["16.5%", "50%", "83.5%"] as const;

function Threads() {
  const threads = threadColumns.map((column, index) => (
    <span
      key={column}
      aria-hidden
      className="absolute agents-couches-thread hidden h-full w-0.5 transform-3d md:motion-safe:block"
      style={{ "--couches-x": column }}
    >
      <span
        data-couches="line"
        className={cn(
          "absolute inset-0 origin-top",
          index === 0 ? "bg-agents-signal" : "bg-agents-ink/25",
        )}
      />
    </span>
  ));
  return (
    <>
      {threads}
      <span
        data-couches="pulse"
        aria-hidden
        className="absolute agents-couches-pulse hidden size-6 -translate-1/2 rounded-full bg-agents-signal opacity-0 ring-4 ring-agents-paper md:motion-safe:block"
        style={{ "--couches-x": threadColumns[0] }}
      />
    </>
  );
}

function LabelText({ label }: { label: CouchesLabel }) {
  return (
    <span className="flex flex-col gap-2">
      <Eyebrow as="span">{label.index}</Eyebrow>
      <span className="font-display text-2xl font-heading text-foreground">{label.title}</span>
      <span className="text-sm text-muted-foreground">{label.detail}</span>
    </span>
  );
}

/* What each layer is, flat to the visitor while the planes turn: a legend under the stack on tablets, a column beside
   it on wide screens with a hairline running to its plane. Read once, in the stack itself. */
function FloatingLabels({ labels }: { labels: CouchesLabels }) {
  return (
    <ul
      aria-hidden
      className="pointer-events-none absolute inset-x-8 bottom-8 hidden grid-cols-3 gap-6 md:motion-safe:grid lg:inset-x-12 lg:inset-y-0 lg:motion-safe:block"
    >
      {(["you", "agents", "tools"] as const).map((key) => (
        <li
          key={key}
          data-couches="label"
          className="agents-couches-label flex items-start gap-4 opacity-0 lg:w-1/4 lg:items-center"
          style={{ "--couches-label-y": labelHeights[key] }}
        >
          <span className="lg:w-4/5">
            <LabelText label={labels[key]} />
          </span>
          <span className="hidden h-px flex-1 bg-agents-ink/30 lg:block" />
        </li>
      ))}
    </ul>
  );
}

function InlineLabel({ label }: { label: CouchesLabel }) {
  return (
    <span className="grid justify-items-center text-center md:motion-safe:hidden">
      <LabelText label={label} />
    </span>
  );
}

/* The camera, the poster's tilt and the rig the planes, threads and pulse turn on. */
function Camera({ children }: { children: ReactNode }) {
  return (
    <div className="grid place-items-center px-5 agents-couches-camera md:px-8 md:motion-safe:absolute md:motion-safe:inset-0">
      <div
        data-couches="tilt"
        className="grid w-full max-w-narrow agents-couches-poster md:motion-safe:transform-3d"
        style={{
          "--couches-y": `${String(couchesPoster.yPercent)}%`,
          "--couches-tilt": `${String(couchesPoster.rotationX)}deg`,
          "--couches-y-wide": `${String(couchesPoster.wideYPercent)}%`,
          "--couches-scale": String(couchesPoster.wideScale),
        }}
      >
        <div
          data-couches="rig"
          className="relative grid w-full gap-6 md:motion-safe:gap-0 md:motion-safe:transform-3d"
        >
          {children}
          <Threads />
        </div>
      </div>
    </div>
  );
}

/* « Vue éclatée »: the promise above the SHUNPO interface, tipped back under the fold. Held over three screens from
   tablets up, the interface opens into its layers (you, the agents, your tools), one task travels down the red
   thread and back, and the layers close into the interface. Phones and reduced motion read the layers one under
   the other, labelled, the routed task settled. */
export function HeroCouches({
  copy,
  backdrop,
  labels,
  workspace,
  agents,
  tools,
  target,
  outro,
  className,
}: HeroCouchesProps) {
  return (
    <ScrollScene choreography={explodeLayers} length="long" minWidth="md" below="header">
      <div
        data-slot="hero-couches"
        className={cn(
          "relative flex w-full flex-col gap-16 md:motion-safe:block md:motion-safe:h-full",
          className,
        )}
      >
        <div
          data-couches="copy"
          className="relative z-10 px-5 md:px-8 md:motion-safe:absolute md:motion-safe:inset-x-0 md:motion-safe:top-10"
        >
          {copy}
        </div>
        <Camera>
          <InlineLabel label={labels.you} />
          <WorkspacePlane workspace={workspace} />
          <InlineLabel label={labels.agents} />
          <AgentsPlane agents={agents} />
          <InlineLabel label={labels.tools} />
          <ToolsPlane tools={tools} target={target} backdrop={backdrop} />
        </Camera>
        <FloatingLabels labels={labels} />
        {outro === undefined ? null : (
          <div
            data-couches="outro"
            className="px-5 md:px-8 md:motion-safe:absolute md:motion-safe:inset-x-0 md:motion-safe:bottom-10 md:motion-safe:opacity-0"
          >
            {outro}
          </div>
        )}
      </div>
    </ScrollScene>
  );
}
