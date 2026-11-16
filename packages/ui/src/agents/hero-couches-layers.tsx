import type { ReactElement, ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";

import { Shuriken } from "../brand/shuriken.tsx";
import { type CouchesApproved, CouchesApproval } from "./hero-couches-approval.tsx";
import { MockWindow } from "./mock-window.tsx";
import { StatusPill } from "./status-pill.tsx";
import { ToolTile } from "./tool-tile.tsx";

type TaskTone = "done" | "working" | "waiting";

export interface CouchesTask {
  icon: SimpleIcon;
  text: string;
  time: string;
  tone: TaskTone;
  status: string;
  /* The routed task: its status once the result has come back up (shown under reduced motion and on phones). */
  settled?: string;
}

export interface CouchesWorkspace {
  title: string;
  context: string;
  status: string;
  heading: string;
  tasks: readonly CouchesTask[];
  aside: string;
  /* The pending decision (an ApprovalCard), and what it reads once settled. */
  approval: ReactNode;
  approved: CouchesApproved;
  /* Under the decision: the call the agent made in a tool. */
  trail?: ReactNode;
}

export interface CouchesAgent {
  name: string;
  role: string;
  doing: string;
}

/* The three planes share one cell from tablets up with motion, and stand one under the other otherwise. */
const planeCell = "md:motion-safe:col-start-1 md:motion-safe:row-start-1";

function ToolMark({ icon }: { icon: SimpleIcon }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill={`#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
}

/* A routed task flips from its working status to its settled one when the result comes back up. */
function TaskStatus({ task }: { task: CouchesTask }) {
  if (task.settled === undefined) {
    return <StatusPill tone={task.tone}>{task.status}</StatusPill>;
  }
  return (
    <span className="grid justify-items-end">
      <span
        data-couches="before"
        aria-hidden
        className="col-start-1 row-start-1 hidden md:motion-safe:inline-flex"
      >
        <StatusPill tone={task.tone}>{task.status}</StatusPill>
      </span>
      <span data-couches="after" className="col-start-1 row-start-1 md:motion-safe:opacity-0">
        <StatusPill tone="done">{task.settled}</StatusPill>
      </span>
    </span>
  );
}

/* 01 · You: the interface SHUNPO builds, where the work shows and a person decides. Opaque: it covers the planes
   under it while they rest together. */
export function WorkspacePlane({ workspace }: { workspace: CouchesWorkspace }) {
  return (
    <div
      data-couches-plane="you"
      className={`${planeCell} relative backface-hidden`}
      style={{ transform: "translateZ(2px)" }}
    >
      <MockWindow
        title={workspace.title}
        context={workspace.context}
        status={<StatusPill tone="done">{workspace.status}</StatusPill>}
        layout="split"
        className="h-full"
      >
        <div className="flex flex-col gap-3 p-4">
          <p className="px-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {workspace.heading}
          </p>
          <ul className="flex flex-col divide-y divide-agents-line">
            {workspace.tasks.map((task) => (
              <li key={task.text} className="flex items-center gap-3 px-2 py-3">
                <ToolMark icon={task.icon} />
                <span className="min-w-0 flex-1 truncate text-sm">{task.text}</span>
                <span className="hidden font-mono text-xs text-muted-foreground lg:inline">
                  {task.time}
                </span>
                <TaskStatus task={task} />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 bg-surface p-4">
          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            {workspace.aside}
          </p>
          <CouchesApproval approval={workspace.approval} approved={workspace.approved} />
          {workspace.trail}
        </div>
      </MockWindow>
    </div>
  );
}

/* 02 · The agents: a sheet of paper between you and your tools, one column per agent at work, split by hairlines. */
export function AgentsPlane({ agents }: { agents: readonly CouchesAgent[] }) {
  return (
    <div
      data-couches-plane="agents"
      className={`${planeCell} agents-sheet agents-sheet-ring grid content-center bg-agents-paper/70 p-4 agents-sheet-clip backface-hidden md:p-6`}
      style={{ transform: "translateZ(1px)" }}
    >
      <ul className="grid grid-cols-1 divide-y divide-agents-line border-y border-agents-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {agents.map((agent) => (
          <li key={agent.name} className="flex flex-col gap-3 p-4">
            <span className="flex items-center gap-2">
              <Shuriken size="sm" />
              <span className="text-sm font-medium">{agent.name}</span>
            </span>
            <span className="text-xs text-muted-foreground">{agent.role}</span>
            <span className="flex items-center gap-2 text-xs text-agents-info">
              <span aria-hidden className="flex gap-1">
                <span className="size-1 rounded-full bg-agents-info" />
                <span className="size-1 rounded-full bg-agents-info/60" />
                <span className="size-1 rounded-full bg-agents-info/30" />
              </span>
              {agent.doing}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ToolsPlaneProps {
  /* Three columns of tools, one under each agent. */
  tools: ReadonlyArray<readonly SimpleIcon[]>;
  /* The tool the routed task lands in. */
  target: string;
  backdrop: ReactElement;
}

/* 03 · Your tools: the software you already have, laid on the plaster slab the whole stack rests on. */
export function ToolsPlane({ tools, target, backdrop }: ToolsPlaneProps) {
  return (
    <div
      data-couches-plane="tools"
      className={`${planeCell} relative isolate grid content-center p-6 md:motion-safe:p-0`}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 overflow-clip agents-sheet-clip agents-sheet-xl md:motion-safe:-inset-6 lg:motion-safe:-inset-10 [&_img]:size-full [&_img]:object-cover"
      >
        {backdrop}
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {tools.map((column) => (
          <li key={column.map((icon) => icon.slug).join()} className="contents md:grid md:gap-4">
            {column.map((icon) => (
              <span key={icon.slug} className="relative">
                <ToolTile icon={icon} />
                {icon.slug === target ? (
                  <span
                    data-couches="target"
                    aria-hidden
                    className="absolute inset-0 opacity-0 ring-2 ring-agents-signal"
                  />
                ) : null}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
