"use client";

import { Check } from "lucide-react";
import type { ComponentProps } from "react";

import { AgentsAction } from "./action.tsx";
import type { OsDecision } from "./os-model.ts";
import { useThinking } from "./use-thinking.ts";

interface OsDecisionCardProps {
  decision: OsDecision;
  decided: boolean;
  /* What the card says once it is done: « Fait. La ligne est au journal. » */
  note: string;
  onApprove: (id: string) => void;
}

/* The action rendered as a real button; its label comes from the action's children. */
function renderApprove(props: ComponentProps<"button">) {
  return <button type="button" {...props} />;
}

/* A decision that waits on the owner inside the system: the reason, the facts, one real button. Approving it
   takes a short beat, then the card settles done and its line lands in the journal. */
export function OsDecisionCard({ decision, decided, note, onApprove }: OsDecisionCardProps) {
  const [state, think] = useThinking();
  if (decided) {
    return (
      <div
        data-slot="os-decision"
        className="agents-sheet flex flex-col gap-1 agents-sheet-fold p-3 agents-sheet-float agents-sheet-ok agents-sheet-lg"
      >
        <output className="flex items-center gap-2 text-xs font-medium text-agents-ok">
          <Check aria-hidden className="size-4" strokeWidth={2.4} />
          {note}
        </output>
        <span className="text-sm">{decision.title}</span>
      </div>
    );
  }
  return (
    <div
      data-slot="os-decision"
      className="agents-sheet flex flex-col gap-3 agents-sheet-fold p-3 agents-sheet-float agents-sheet-wait agents-sheet-lg md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-agents-wait">{decision.reason}</span>
        <span className="text-sm font-medium">{decision.title}</span>
        <span className="text-sm text-muted-foreground">{decision.detail}</span>
      </div>
      <AgentsAction
        render={renderApprove}
        size="sm"
        state={state}
        className="self-start md:shrink-0"
        onClick={() => {
          think(() => {
            onApprove(decision.id);
          });
        }}
      >
        {decision.action}
      </AgentsAction>
    </div>
  );
}
