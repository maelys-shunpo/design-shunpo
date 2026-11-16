import type { ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";

import { type LiveStep, liveAttributes } from "./live.ts";

interface SyncEventProps extends LiveStep {
  icon: SimpleIcon;
  tool: string;
  event: string;
  time: string;
  status: ReactNode;
}

/* One line of the agents' activity: which tool, what happened, when. */
export function SyncEvent({ icon, tool, event, time, status, live, liveKind }: SyncEventProps) {
  return (
    <li
      data-slot="sync-event"
      {...liveAttributes({ live, liveKind })}
      className="flex items-center gap-3 border-b border-agents-line px-4 py-3 last:border-b-0"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill={`#${icon.hex}`}>
        <path d={icon.path} />
      </svg>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs text-muted-foreground">{tool}</span>
        <span className="truncate text-sm">{event}</span>
      </span>
      <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
        {time}
      </span>
      {status}
    </li>
  );
}
