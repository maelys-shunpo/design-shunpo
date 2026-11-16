import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type { SimpleIcon } from "simple-icons";

import { cn } from "../lib/cn.ts";
import type { WeekTask } from "./hero-semaine-choreography.ts";

declare module "react" {
  interface CSSProperties {
    /* Where a cell of the week sits (`agents-week-place`): its day, its first and its last half-hour. */
    "--week-day"?: number;
    "--week-start"?: number;
    "--week-end"?: number;
  }
}

export interface WeekCalendar {
  /* The app in the title bar, « Agenda », and where it lives, « Semaine du 9 novembre ». */
  title: string;
  context: string;
  status: string;
  /* Five day names, Monday first. */
  days: readonly string[];
  /* The hours down the gutter, one per two half-hours, from 09:00. */
  hours: readonly string[];
  /* The word on a slot the agent gave back, « Libre ». */
  free: string;
}

/* Cells are placed by their coordinates (`agents-week-place`): -1 as a day is the hours' gutter, -1 to 0 as rows is
   the day names' row. */
function ToolMark({ tool, className }: { tool: SimpleIcon; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("size-3 shrink-0", className)}
      fill={`#${tool.hex}`}
    >
      <path d={tool.path} />
    </svg>
  );
}

/* A task of an hour and a half or more has room for its hours, or its place, under its title. */
const LONG_TASK = 3;

/* How long a slot lasts, the way a calendar writes it: « 30 min », « 1 h », « 1 h 30 ». */
function lasting(slots: number): string {
  const hours = Math.floor(slots / 2);
  if (hours === 0) {
    return "30\u00A0min";
  }
  return slots % 2 === 0 ? `${String(hours)}\u00A0h` : `${String(hours)}\u00A0h\u00A030`;
}

function clock(slot: number): string {
  const minutes = 9 * 60 + slot * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 === 0 ? "00" : "30"}`;
}

const cardVariants = cva(
  "relative flex h-full flex-col gap-0.5 overflow-clip p-1 text-xs md:px-2",
  {
    variants: {
      kind: {
        /* A task that repeats: grey, in its tool. */
        routine: "bg-muted text-agents-ink",
        /* People's time: ink, it stays. */
        person: "bg-agents-ink text-agents-paper",
        /* Time the agent gave back: paper, a dashed hairline, its length. */
        free: "flex-row flex-wrap content-start gap-x-1 border border-dashed border-agents-line bg-agents-paper font-mono text-agents-dim",
      },
    },
  },
);

/* One task in the week. A routine carries its done state: hidden until the sweep ticks it from tablets up with
   motion, shown at once on phones and under reduced motion, where the week reads ticked, its slots free. */
function TaskBlock({ task, free }: { task: WeekTask; free: string }) {
  const { routine } = task;
  const long = task.end - task.start >= LONG_TASK;
  /* A meeting's place needs a longer block than a routine's hours, its title often runs on two lines. */
  const roomy = routine === undefined ? task.end - task.start > LONG_TASK : long;
  return (
    <div
      data-week-task={task.id}
      className="agents-week-place p-0.5"
      style={{ "--week-day": task.day, "--week-start": task.start, "--week-end": task.end }}
    >
      <div className={cardVariants({ kind: routine === undefined ? "person" : "routine" })}>
        <span className="flex min-w-0 items-center gap-1">
          {routine === undefined ? null : <ToolMark tool={routine.tool} />}
          <span
            className={cn(
              "font-medium",
              routine === undefined ? "lg:truncate" : "truncate max-lg:sr-only",
            )}
          >
            {task.title}
          </span>
        </span>
        {roomy ? (
          <span
            className={cn(
              "hidden truncate font-mono",
              routine === undefined
                ? "text-agents-paper/70 lg:block"
                : "text-agents-dim lg:motion-reduce:block",
            )}
          >
            {task.note ?? `${clock(task.start)} – ${clock(task.end)}`}
          </span>
        ) : null}
        {routine === undefined ? null : (
          <span
            aria-hidden
            data-week-done
            className="absolute inset-0 bg-agents-ok-tint p-1 text-agents-ok md:px-2 md:motion-safe:opacity-0"
          >
            <span data-week-label className="flex h-full flex-col justify-between">
              <span className="flex min-w-0 items-center gap-1">
                <Check className="size-3 shrink-0" strokeWidth={2.5} />
                <ToolMark tool={routine.tool} className="lg:hidden" />
                <span className="hidden truncate font-medium lg:inline">{task.title}</span>
              </span>
              {long ? (
                <span className="hidden font-mono md:motion-reduce:block">
                  {`${free} · ${lasting(task.end - task.start)}`}
                </span>
              ) : null}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

/* The slot a routine leaves once the agent took it, shown as it flies away: from tablets up with motion only. */
function FreeSlot({ task, free }: { task: WeekTask; free: string }) {
  return (
    <div
      aria-hidden
      data-week-free={task.id}
      className="agents-week-place hidden p-0.5 md:motion-safe:block md:motion-safe:opacity-0"
      style={{ "--week-day": task.day, "--week-start": task.start, "--week-end": task.end }}
    >
      <span className={cardVariants({ kind: "free" })}>
        <span>{free}</span>
        <span>{`·\u00A0${lasting(task.end - task.start)}`}</span>
      </span>
    </div>
  );
}

/* The week itself: day names, hours, a hairline grid, the freed slots under the tasks, and the agent's sweep, an ink
   cursor over the five days. */
export function WeekGrid({
  calendar,
  tasks,
}: {
  calendar: WeekCalendar;
  tasks: readonly WeekTask[];
}) {
  return (
    <div className="relative agents-week-grid min-h-0 min-w-0 flex-1 p-2 md:p-3">
      {calendar.days.map((day, index) => (
        <span
          key={day}
          className="agents-week-place truncate px-1 py-2 text-xs font-medium text-agents-ink md:px-2"
          style={{ "--week-day": index, "--week-start": -1, "--week-end": 0 }}
        >
          {day}
        </span>
      ))}
      {calendar.hours.map((hour, index) => (
        <span
          key={hour}
          className="agents-week-place font-mono text-xs text-agents-dim"
          style={{ "--week-day": -1, "--week-start": index * 2, "--week-end": index * 2 + 2 }}
        >
          {hour}
        </span>
      ))}
      {calendar.days.flatMap((day, dayIndex) =>
        calendar.hours.map((hour, hourIndex) => (
          <span
            key={`${day}-${hour}`}
            aria-hidden
            className="agents-week-place border-t border-l border-agents-line"
            style={{
              "--week-day": dayIndex,
              "--week-start": hourIndex * 2,
              "--week-end": hourIndex * 2 + 2,
            }}
          />
        )),
      )}
      {tasks.map((task) =>
        task.routine === undefined ? null : (
          <FreeSlot key={`${task.id}-free`} task={task} free={calendar.free} />
        ),
      )}
      {tasks.map((task) => (
        <TaskBlock key={task.id} task={task} free={calendar.free} />
      ))}
      <div
        aria-hidden
        className="pointer-events-none relative agents-week-days hidden md:motion-safe:block"
      >
        <span data-week-sweep-line className="absolute inset-y-0 left-0 w-0.5 bg-agents-ink">
          <span className="absolute top-0 left-1/2 size-3 -translate-x-1/2 rounded-full bg-agents-ink" />
        </span>
      </div>
    </div>
  );
}

export { ToolMark };
