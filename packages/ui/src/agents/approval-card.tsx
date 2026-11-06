import type { ReactNode } from "react";

import { type LiveStep, liveAttributes } from "./live.ts";

interface ApprovalCardProps extends LiveStep {
  /* Why the agent stops and asks: « Montant supérieur à 2 000 € ». */
  reason: string;
  detail: string;
  approve: string;
  edit: string;
  /* Who approved, shown once a person said yes: an element carrying its own live step. */
  outcome?: ReactNode;
}

/* The moment an agent hands a sensitive decision to a person: the reason, two choices, then who decided. */
export function ApprovalCard({
  reason,
  detail,
  approve,
  edit,
  outcome,
  live,
  liveKind,
}: ApprovalCardProps) {
  return (
    <div
      data-slot="approval-card"
      {...liveAttributes({ live, liveKind })}
      className="flex flex-col gap-3 rounded-lg border border-agents-wait/25 bg-agents-wait-tint p-3"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-agents-wait">{reason}</span>
        <span className="text-sm">{detail}</span>
      </div>
      <div aria-hidden className="flex gap-2">
        <span className="inline-flex h-8 items-center rounded-md bg-agents-ink px-3 text-xs font-medium text-agents-paper">
          {approve}
        </span>
        <span className="inline-flex h-8 items-center rounded-md border border-agents-ink/20 bg-surface px-3 text-xs font-medium">
          {edit}
        </span>
      </div>
      {outcome}
    </div>
  );
}
