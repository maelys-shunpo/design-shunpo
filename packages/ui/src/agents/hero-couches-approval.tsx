import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { Icon } from "../components/icon.tsx";
import { Avatar } from "./avatar.tsx";

/* What the approval reads once the person said yes. */
export interface CouchesApproved {
  reason: string;
  detail: string;
  /* « Approuvé par Claire M. · 09:44 ». */
  outcome: string;
  initials: string;
}

interface CouchesApprovalProps {
  /* The pending decision, an ApprovalCard composed by the page. */
  approval: ReactNode;
  approved: CouchesApproved;
}

/* The decision that waits for you. From tablets up with motion it waits (an ApprovalCard), takes a Fushimi ring when the
   result comes back up the red thread, then settles; phones and reduced motion read it settled. */
export function CouchesApproval({ approval, approved }: CouchesApprovalProps) {
  return (
    <div className="relative grid">
      <div data-couches="approval" className="col-start-1 row-start-1 hidden md:motion-safe:block">
        {approval}
      </div>
      <div
        data-couches="approved"
        className="agents-sheet col-start-1 row-start-1 flex flex-col gap-3 agents-sheet-fold p-3 agents-sheet-float agents-sheet-ok agents-sheet-lg md:motion-safe:opacity-0"
      >
        <span className="flex flex-col gap-1">
          <span className="text-xs font-medium text-agents-ok">{approved.reason}</span>
          <span className="text-sm">{approved.detail}</span>
        </span>
        <span className="flex items-center gap-2 text-sm font-medium text-agents-ink">
          <Avatar initials={approved.initials} tone="mint" size="md" />
          <span>{approved.outcome}</span>
          <Icon icon={Check} size="sm" className="text-agents-ok" />
        </span>
      </div>
      <span
        data-couches="approval-ring"
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-0 ring-2 ring-agents-signal"
      />
    </div>
  );
}
