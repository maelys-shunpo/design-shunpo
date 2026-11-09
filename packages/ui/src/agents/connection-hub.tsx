"use client";

import { lazy, type ReactNode, useState } from "react";
import type { SimpleIcon } from "simple-icons";

import { cn } from "../lib/cn.ts";
import { AfterIdle } from "../motion/after-idle.tsx";

const LazyConnectionHubMotion = lazy(async () => {
  const { ConnectionHubMotion } = await import("./connection-hub-motion.tsx");
  return { default: ConnectionHubMotion };
});

declare module "react" {
  interface CSSProperties {
    /* Where a tool sits around the hub, in percent of the stage: on phones, then from tablets up
       (`agents-hub-place`). */
    "--hub-x"?: string;
    "--hub-y"?: string;
    "--hub-x-wide"?: string;
    "--hub-y-wide"?: string;
  }
}

export interface HubMessage {
  /* The slug of the tool the agent just worked in. */
  tool: string;
  text: string;
}

interface Orbit {
  /* Radii in percent of the stage's width and height. */
  x: number;
  y: number;
  /* Where the first tool sits, in degrees from three o'clock, clockwise. */
  start: number;
}

/* Phones: a square stage, only the near tools. Tablets up: a wide stage, two orbits. */
const orbits = {
  near: { narrow: { x: 34, y: 34, start: -60 }, wide: { x: 22, y: 31, start: -60 } },
  far: { wide: { x: 43, y: 42, start: -30 } },
} as const;

interface Placed {
  icon: SimpleIcon;
  far: boolean;
  narrow: { x: number; y: number } | undefined;
  wide: { x: number; y: number };
}

function around(orbit: Orbit, index: number, count: number) {
  const angle = ((orbit.start + (360 / count) * index) * Math.PI) / 180;
  return {
    x: Math.round((50 + orbit.x * Math.cos(angle)) * 100) / 100,
    y: Math.round((50 + orbit.y * Math.sin(angle)) * 100) / 100,
  };
}

function place(near: readonly SimpleIcon[], far: readonly SimpleIcon[]): Placed[] {
  return [
    ...near.map((icon, index) => ({
      icon,
      far: false,
      narrow: around(orbits.near.narrow, index, near.length),
      wide: around(orbits.near.wide, index, near.length),
    })),
    ...far.map((icon, index) => ({
      icon,
      far: true,
      narrow: undefined,
      wide: around(orbits.far.wide, index, far.length),
    })),
  ];
}

/* Each drawing has the stage's own proportions, so a dash along a thread keeps its length: a square on phones, 16:9
   from tablets up. The pulse is drawn in the drawing's units, about 2 px wide on screen. */
const frames = {
  narrow: { width: 100, height: 100, pulse: 0.6 },
  wide: { width: 160, height: 90, pulse: 0.3 },
} as const;

type Shape = keyof typeof frames;

/* The orbits the tools sit on, dotted. */
function Orbits({ shape }: { shape: Shape }) {
  const { width, height } = frames[shape];
  const rings = shape === "narrow" ? [orbits.near.narrow] : [orbits.near.wide, orbits.far.wide];
  return rings.map((ring) => (
    <ellipse
      key={ring.x}
      cx={width / 2}
      cy={height / 2}
      rx={(ring.x * width) / 100}
      ry={(ring.y * height) / 100}
      className="agents-hub-orbit"
    />
  ));
}

/* The threads from the hub to every tool, with the pulse each one carries (`[data-hub-pulse]`), in one drawing
   for a stage shape. */
function Threads({
  tools,
  shape,
  className,
}: {
  tools: Placed[];
  shape: Shape;
  className: string;
}) {
  const { width, height, pulse } = frames[shape];
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    >
      <Orbits shape={shape} />
      {tools.map(({ icon, ...spot }) => {
        const end = spot[shape];
        if (end === undefined) {
          return null;
        }
        const line = {
          x1: width / 2,
          y1: height / 2,
          x2: (end.x * width) / 100,
          y2: (end.y * height) / 100,
        };
        return (
          <g key={icon.slug}>
            <line {...line} className="agents-hub-thread" />
            <line
              {...line}
              data-hub-pulse={icon.slug}
              pathLength={100}
              strokeWidth={pulse}
              className="agents-hub-pulse"
            />
          </g>
        );
      })}
    </svg>
  );
}

function ToolDot({ tool, lit }: { tool: Placed; lit: boolean }) {
  const { icon, narrow, wide } = tool;
  return (
    <li
      data-hub-tool={icon.slug}
      data-on={lit ? "" : undefined}
      className={cn(
        "absolute agents-hub-place grid size-12 place-items-center rounded-surface border border-agents-line bg-surface shadow-agents-card transition-colors duration-300 data-on:border-agents-signal md:size-16",
        tool.far && "hidden md:grid",
      )}
      style={{
        "--hub-x": `${String(narrow?.x ?? wide.x)}%`,
        "--hub-y": `${String(narrow?.y ?? wide.y)}%`,
        "--hub-x-wide": `${String(wide.x)}%`,
        "--hub-y-wide": `${String(wide.y)}%`,
      }}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6 md:size-8" fill={`#${icon.hex}`}>
        <path d={icon.path} />
      </svg>
      <span className="sr-only">{icon.title}</span>
    </li>
  );
}

/* What the agent just did, one line at a time under the hub; every line is in the page. */
function Messages({ messages, tools }: { messages: readonly HubMessage[]; tools: Placed[] }) {
  return (
    <ol className="agents-hub-caption h-10 w-full md:w-auto">
      {messages.map((message, index) => {
        const tool = tools.find((placed) => placed.icon.slug === message.tool)?.icon;
        return (
          <li
            key={message.text}
            data-hub-message={message.tool}
            data-on={index === 0 ? "" : undefined}
            className="absolute inset-x-0 top-0 flex h-10 items-center justify-center gap-2 rounded-full border border-agents-line bg-surface px-4 text-sm whitespace-nowrap text-agents-ink opacity-0 shadow-agents-card transition-opacity duration-300 data-on:opacity-100 md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
          >
            {tool === undefined ? null : (
              <>
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-4 shrink-0"
                  fill={`#${tool.hex}`}
                >
                  <path d={tool.path} />
                </svg>
                <span className="font-medium">{tool.title}</span>
              </>
            )}
            <span className="truncate text-muted-foreground">{message.text}</span>
          </li>
        );
      })}
    </ol>
  );
}

interface ConnectionHubProps {
  /* The centre: the agent every tool is wired to. */
  hub: ReactNode;
  /* The tools on the near orbit (shown on phones too), then on the far one (from tablets up). Six on each sit
     between one another. */
  near: readonly SimpleIcon[];
  far: readonly SimpleIcon[];
  /* What the agent does, in order: each sends a pulse from the hub to its tool and shows its line. */
  messages: readonly HubMessage[];
  label: string;
  className?: string | undefined;
}

/* The tools wired to one agent: the hub in the middle, the tools on two orbits, a pulse running down one thread at a
   time while the line under the hub says what the agent did there. Still under reduced motion, before the page is idle,
   off screen, and under the pointer or focus. */
export function ConnectionHub({ hub, near, far, messages, label, className }: ConnectionHubProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const tools = place(near, far);
  const first = messages[0]?.tool;
  return (
    <figure
      ref={setRoot}
      data-slot="connection-hub"
      aria-label={label}
      className={cn("relative flex w-full flex-col items-center gap-6", className)}
    >
      <div className="relative aspect-square w-full max-w-prose md:aspect-16/9 md:max-w-none">
        <Threads tools={tools} shape="narrow" className="md:hidden" />
        <Threads tools={tools} shape="wide" className="hidden md:block" />
        <div className="absolute top-1/2 left-1/2 grid -translate-1/2 place-items-center">
          <span
            aria-hidden
            data-hub-ring=""
            className="absolute size-full rounded-full border-2 border-agents-signal opacity-0"
          />
          <div className="grid size-24 place-items-center rounded-full border border-agents-line bg-surface shadow-agents-float md:size-32">
            {hub}
          </div>
        </div>
        <ul aria-label="Outils reliés">
          {tools.map((tool) => (
            <ToolDot key={tool.icon.slug} tool={tool} lit={tool.icon.slug === first} />
          ))}
        </ul>
      </div>
      <Messages messages={messages} tools={tools} />
      <AfterIdle>
        <LazyConnectionHubMotion root={root} />
      </AfterIdle>
    </figure>
  );
}
