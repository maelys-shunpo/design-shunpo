import { type ReactElement, useMemo } from "react";

import { routinesOf, type WeekTask } from "./hero-semaine-choreography.ts";
import { JournalPanel, type WeekJournal } from "./hero-semaine-journal.tsx";
import { type WeekCalendar, WeekGrid } from "./hero-semaine-week.tsx";
import { PhotoStage } from "./photo-stage.tsx";
import { StatusPill } from "./status-pill.tsx";

export interface WeekWindowProps {
  backdrop: ReactElement;
  calendar: WeekCalendar;
  tasks: readonly WeekTask[];
  journal: WeekJournal;
}

/* The week's window on a photographed wall: an agenda in its title bar, the week, and the agent's journal beside it. */
export function WeekWindow({ backdrop, calendar, tasks, journal }: WeekWindowProps) {
  const routines = useMemo(() => routinesOf(tasks), [tasks]);
  return (
    <PhotoStage
      backdrop={
        <span data-week-light className="absolute -inset-x-16 inset-y-0 block">
          {backdrop}
        </span>
      }
      padding="sm"
      className="h-full grid-rows-1 md:p-4 lg:p-4"
    >
      <div className="agents-sheet agents-sheet-ring flex h-full min-h-0 flex-col overflow-clip text-agents-ink agents-sheet-lift">
        <div className="flex items-center justify-between gap-4 border-b border-agents-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span aria-hidden className="flex gap-1">
              <span className="size-3 rounded-full bg-agents-line" />
              <span className="size-3 rounded-full bg-agents-line" />
              <span className="size-3 rounded-full bg-agents-line" />
            </span>
            <span className="text-sm font-medium whitespace-nowrap">{calendar.title}</span>
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {calendar.context}
            </span>
          </div>
          <StatusPill tone="working">{calendar.status}</StatusPill>
        </div>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <WeekGrid calendar={calendar} tasks={tasks} />
          <JournalPanel journal={journal} routines={routines} />
        </div>
      </div>
    </PhotoStage>
  );
}
