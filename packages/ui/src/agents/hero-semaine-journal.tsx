import { Check } from "lucide-react";

import { Shuriken } from "../brand/shuriken.tsx";
import { Avatar } from "./avatar.tsx";
import type { WeekTask } from "./hero-semaine-choreography.ts";
import { ToolMark } from "./hero-semaine-week.tsx";
import { StatusPill } from "./status-pill.tsx";

export interface WeekJournal {
  title: string;
  /* What the empty journal says before the sweep: « Prêt à reprendre vos tâches lundi 09:00 ». */
  idle: string;
  /* The one decision left to a person once the week is done. */
  approval: { initials: string; text: string; detail: string; status: string };
}

/* The agent's journal beside the week: one line per routine it took, in the order it met them, then the approval
   waiting on a person. From tablets up with motion, the lines are empty until each routine lands in its own; on
   phones and under reduced motion the journal reads complete. */
export function JournalPanel({
  journal,
  routines,
}: {
  journal: WeekJournal;
  routines: readonly WeekTask[];
}) {
  return (
    <div className="flex min-h-0 agents-week-journal shrink-0 flex-col gap-2 border-t border-agents-line bg-agents-paper p-3 md:border-t-0 md:border-l">
      <p className="flex items-center gap-2 text-xs font-medium text-agents-ink">
        <Shuriken size="sm" />
        {journal.title}
      </p>
      {/* Held, the journal shows what fits and scrolls up as lines land below it, newest in view. */}
      <div className="relative min-h-0 flex-1 md:motion-safe:overflow-clip">
        <p
          data-week-idle
          className="absolute inset-x-0 top-0 hidden h-6 items-center border border-dashed border-agents-line px-2 text-xs text-agents-dim md:motion-safe:flex"
        >
          {journal.idle}
        </p>
        <ol data-week-log className="flex flex-col">
          {routines.map((task) =>
            task.routine === undefined ? null : (
              <li
                key={task.id}
                data-week-row={task.id}
                className="flex h-6 min-w-0 items-center gap-2 border-b border-agents-line px-2 text-xs text-agents-ink md:motion-safe:opacity-0"
              >
                <Check aria-hidden className="size-3 shrink-0 text-agents-ok" strokeWidth={2.5} />
                <ToolMark tool={task.routine.tool} />
                <span className="min-w-0 flex-1 truncate">{task.routine.done}</span>
                <span className="shrink-0 font-mono text-agents-dim">{task.routine.at}</span>
              </li>
            ),
          )}
        </ol>
      </div>
      <p
        data-week-approval
        className="flex min-w-0 shrink-0 items-start gap-2 bg-agents-wait-tint p-2 text-xs text-agents-ink md:motion-safe:opacity-0"
      >
        <Avatar initials={journal.approval.initials} tone="warm" size="sm" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium">{journal.approval.text}</span>
          <span className="flex min-w-0 items-center justify-between gap-2">
            <span className="truncate font-mono text-agents-dim">{journal.approval.detail}</span>
            <StatusPill tone="waiting">{journal.approval.status}</StatusPill>
          </span>
        </span>
      </p>
    </div>
  );
}
