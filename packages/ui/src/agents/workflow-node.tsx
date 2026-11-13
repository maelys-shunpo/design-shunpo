import type { ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";

import { cn } from "../lib/cn.ts";

interface WorkflowNodeProps {
  icon?: SimpleIcon | undefined;
  /* What the node is in the flow: « Déclencheur », « Agent IA ». */
  kind: string;
  title: string;
  status?: ReactNode;
  /* The node the agent itself runs, marked with the signal square. */
  agent?: boolean;
  /* Draw the link to the next node below this one. */
  linked?: boolean;
}

/* One step of a workflow, drawn like a node in a builder, with the link to the next one. */
export function WorkflowNode({
  icon,
  kind,
  title,
  status,
  agent = false,
  linked = false,
}: WorkflowNodeProps) {
  return (
    <li data-slot="workflow-node" className="flex flex-col items-center">
      <div
        className={cn(
          "agents-sheet flex w-full items-center gap-3 p-3 text-agents-ink agents-sheet-lift agents-sheet-sm",
          agent && "agents-sheet-signal",
        )}
      >
        <span aria-hidden className="grid size-8 shrink-0 place-items-center bg-muted">
          {icon === undefined ? (
            <span className={cn("size-3", agent ? "bg-agents-signal" : "bg-agents-ink")} />
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" fill={`#${icon.hex}`}>
              <path d={icon.path} />
            </svg>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-mono text-xs text-muted-foreground uppercase">{kind}</span>
          <span className="text-sm font-medium text-pretty">{title}</span>
        </span>
        {status}
      </div>
      {linked ? <span aria-hidden className="h-6 w-px bg-agents-ink/25" /> : null}
    </li>
  );
}
