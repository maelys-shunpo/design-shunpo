import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import { type LiveStep, liveAttributes } from "./live.ts";

interface MailRowProps extends LiveStep {
  from: string;
  subject: string;
  time: string;
  /* The row's status, a StatusPill. */
  status?: ReactNode;
  /* An attachment's file name. */
  attachment?: string | undefined;
  selected?: boolean;
}

/* A message in an inbox the agent reads. */
export function MailRow({
  from,
  subject,
  time,
  status,
  attachment,
  selected = false,
  live,
  liveKind,
}: MailRowProps) {
  return (
    <div
      data-slot="mail-row"
      {...liveAttributes({ live, liveKind })}
      className={cn(
        "flex flex-col gap-1 rounded-lg border px-3 py-2",
        selected ? "border-agents-ink/15 bg-surface shadow-agents-card" : "border-transparent",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium">{from}</span>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">{time}</span>
      </div>
      <span className="truncate text-xs text-muted-foreground">{subject}</span>
      {attachment === undefined && status === undefined ? null : (
        <div className="flex items-center justify-between gap-2">
          {attachment === undefined ? (
            <span />
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-agents-line bg-surface px-2 py-0.5 font-mono text-xs text-muted-foreground">
              <span aria-hidden className="size-2 rounded-sm bg-agents-signal" />
              {attachment}
            </span>
          )}
          {status}
        </div>
      )}
    </div>
  );
}
