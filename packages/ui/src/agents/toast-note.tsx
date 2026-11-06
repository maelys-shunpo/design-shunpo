import type { SimpleIcon } from "simple-icons";

import { cn } from "../lib/cn.ts";
import { type LiveStep, liveAttributes } from "./live.ts";

interface ToastNoteProps extends LiveStep {
  icon?: SimpleIcon | undefined;
  app: string;
  message: string;
  time?: string | undefined;
  className?: string | undefined;
}

/* A notification another tool shows once the agent is done: « Slack · #compta ». */
export function ToastNote({ icon, app, message, time, live, liveKind, className }: ToastNoteProps) {
  return (
    <div
      data-slot="toast-note"
      {...liveAttributes({ live, liveKind })}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-agents-line bg-surface p-3 text-agents-ink shadow-agents-float",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-agents-ink text-agents-paper"
      >
        {icon === undefined ? (
          <span className="size-2 bg-agents-signal" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-4 fill-current">
            <path d={icon.path} />
          </svg>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-baseline gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-agents-ink">{app}</span>
          {time === undefined ? null : <span className="font-mono">{time}</span>}
        </span>
        <span className="text-sm">{message}</span>
      </span>
    </div>
  );
}
