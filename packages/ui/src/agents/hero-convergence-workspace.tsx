import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";

import { Avatar } from "./avatar.tsx";
import { MockWindow } from "./mock-window.tsx";
import { StatusPill } from "./status-pill.tsx";

export interface WorkspaceTask {
  id: string;
  icon: SimpleIcon;
  /* What the agent did in the tool, in a few words. */
  task: string;
  /* The tool and the time: « Gmail · 09:42 ». */
  meta: string;
  /* done: the agent finished it; waiting: a person decides, `owner` gives their initials. */
  status: { tone: "done" | "waiting"; label: string; owner?: string };
}

export interface WorkspaceFrame {
  title: string;
  context: string;
  /* The word in the window's corner: « En service ». */
  status: string;
  /* Read while the statuses turn: « En cours ». */
  working?: string;
}

interface ConvergeWorkspaceProps {
  frame: WorkspaceFrame;
  tasks: readonly WorkspaceTask[];
}

/* A row of the workspace. signal: the one decision left to a person, ruled in Fushimi, the screen's only red once
   the copy and its call have left. */
const rowVariants = cva("relative flex items-center gap-3 px-4 py-3 md:py-4", {
  variants: {
    tone: {
      quiet: "",
      signal: "bg-agents-signal-tint/40",
    },
  },
  defaultVariants: { tone: "quiet" },
});

function WorkspaceRow({
  id,
  tone,
  children,
}: {
  id: string;
  tone: "quiet" | "signal";
  children: ReactNode;
}) {
  return (
    <li data-converge-row={id} className={rowVariants({ tone })}>
      {tone === "signal" ? (
        <span aria-hidden className="absolute inset-y-0 inset-s-0 w-0.5 bg-agents-signal" />
      ) : null}
      {children}
    </li>
  );
}

/* Work under way, the way a chat shows someone typing. */
function TypingMark() {
  return (
    <span className="flex gap-0.5">
      <span className="size-1 rounded-full bg-agents-info" />
      <span className="size-1 rounded-full bg-agents-info/60" />
      <span className="size-1 rounded-full bg-agents-info/30" />
    </span>
  );
}

/* The status cell: the final word in the page, and an « in progress » pill laid over it (out of the flow) that the scene turns away. */
function StatusCell({ status, working }: { status: WorkspaceTask["status"]; working: string }) {
  return (
    <span data-converge-fill className="relative flex shrink-0 justify-end">
      <span
        aria-hidden
        data-converge-status="working"
        className="absolute inset-y-0 inset-e-0 flex items-center opacity-0"
      >
        <StatusPill tone="working" mark={<TypingMark />}>
          {working}
        </StatusPill>
      </span>
      <span data-converge-status="final" className="flex items-center gap-2">
        {status.owner === undefined ? null : (
          <Avatar initials={status.owner} tone="warm" size="sm" />
        )}
        <StatusPill
          tone={status.tone}
          mark={status.tone === "done" ? <Check className="size-3" strokeWidth={2.5} /> : undefined}
        >
          {status.label}
        </StatusPill>
      </span>
    </span>
  );
}

/* One window where every tool's work lands: a row per task, its tool's logo, what was done and its status. */
export function ConvergeWorkspace({ frame, tasks }: ConvergeWorkspaceProps) {
  const working = frame.working ?? "En cours";
  return (
    <MockWindow
      title={frame.title}
      context={frame.context}
      status={<StatusPill tone="working">{frame.status}</StatusPill>}
    >
      <ul aria-label={frame.title} className="flex flex-col divide-y divide-agents-line bg-surface">
        {tasks.map((task) => (
          <WorkspaceRow
            key={task.id}
            id={task.id}
            tone={task.status.tone === "waiting" ? "signal" : "quiet"}
          >
            <span
              data-converge-tile
              className="grid size-8 shrink-0 place-items-center border border-agents-line bg-surface"
            >
              <svg
                aria-hidden
                data-converge-fill
                viewBox="0 0 24 24"
                className="size-4"
                fill={`#${task.icon.hex}`}
              >
                <path d={task.icon.path} />
              </svg>
            </span>
            <span data-converge-fill className="flex min-w-0 grow flex-col">
              <span className="text-sm font-medium text-agents-ink md:truncate">{task.task}</span>
              <span className="truncate text-xs text-muted-foreground">{task.meta}</span>
            </span>
            <StatusCell status={task.status} working={working} />
          </WorkspaceRow>
        ))}
      </ul>
    </MockWindow>
  );
}
