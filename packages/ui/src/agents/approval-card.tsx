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
      className="agents-sheet flex flex-col gap-3 agents-sheet-fold p-3 agents-sheet-float agents-sheet-wait agents-sheet-lg"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-agents-wait">{reason}</span>
        <span className="text-sm">{detail}</span>
      </div>
      <div aria-hidden className="flex gap-2">
        <span className="agents-cut pointer-events-none relative isolate inline-flex h-8 items-center px-3 text-xs font-medium text-agents-paper before:bg-agents-ink">
          {approve}
        </span>
        <span className="agents-cut pointer-events-none relative isolate inline-flex h-8 items-center px-3 text-xs font-medium agents-cut-line before:bg-agents-ink/20">
          {edit}
        </span>
      </div>
      {outcome}
    </div>
  );
}
