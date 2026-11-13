import type { SimpleIcon } from "simple-icons";

import { ease } from "../motion/tokens.ts";
import { type Landing, measureWeek } from "./hero-semaine-measure.ts";

/* The week on show: five working days, nine hours cut in half-hours (09:00 to 18:00). */
const WEEK_DAYS = 5;
const WEEK_SLOTS = 18;

export interface WeekTask {
  id: string;
  /* 0 is Monday. */
  day: number;
  /* Half-hours from 09:00: a task from 10:30 to 12:00 starts at 3 and ends at 6. */
  start: number;
  end: number;
  title: string;
  /* Who or where, under a meeting's title. */
  note?: string | undefined;
  /* A task that repeats every week: the tool it is done in and the line the agent leaves in its journal. People's
     time (meetings, workshops) has none and stays in the week. */
  routine?: { tool: SimpleIcon; done: string; at: string } | undefined;
}

/* Shares of the hold (the timeline runs from 0 to 1 over three screens of scroll). The sweep crosses the week from
   Monday to Friday; each routine is ticked, its label fades as it leaves, a band of its colour flies into its journal
   line, the line lands and the freed slot shows itself, overlapping. */
export const SWEEP = { start: 0.08, end: 0.8 } as const;
const IDLE_OUT = { at: 0.03, span: 0.04 } as const;
const TICK_SPAN = 0.014;
const FLIGHT = { delay: 0.016, span: 0.05 } as const;
const ROW = { delay: 0.05, span: 0.024 } as const;
const LINE_OUT = { at: 0.8, span: 0.03 } as const;
const APPROVAL = { at: 0.82, span: 0.04 } as const;
const WORD = { at: 0.86, span: 0.08 } as const;
/* The light on the wall drifts with the week, as a day passes: a share of the backdrop's own width. */
const LIGHT_DRIFT = -4;
/* A tick lands in the first two thirds of a day's column, so the sweep is still inside that day when it happens. */
const DAY_ENTRY = 0.08;
const DAY_SPAN = 0.72;
/* How far a word travels as it swaps, in its own height. */
const WORD_TRAVEL = 40;

/* Where the sweep meets a task, from 0 (Monday 09:00) to 1 (past Friday): its day, then its hour inside the day. */
export function sweepAt(task: WeekTask): number {
  return (task.day + DAY_ENTRY + (DAY_SPAN * task.start) / WEEK_SLOTS) / WEEK_DAYS;
}

export function routinesOf(tasks: readonly WeekTask[]): WeekTask[] {
  return tasks
    .filter((task) => task.routine !== undefined)
    .toSorted((a, b) => sweepAt(a) - sweepAt(b));
}

function fly(
  timeline: gsap.core.Timeline,
  flight: { block: string; landing: Landing; at: number },
): void {
  const { block, landing, at } = flight;
  timeline.set(block, { zIndex: 1, transformOrigin: "0 0" }, at);
  /* An arc: across on a slow start, down on a quick one, so the band curves into the journal. */
  timeline.to(
    block,
    { x: landing.x, scale: landing.scale, duration: FLIGHT.span, ease: ease.inOut },
    at,
  );
  timeline.to(block, { y: landing.y, duration: FLIGHT.span, ease: ease.standard }, at);
  timeline.to(
    block,
    { opacity: 0, duration: FLIGHT.span / 3, ease: ease.inOut },
    at + (FLIGHT.span * 2) / 3,
  );
}

function takeRoutine(
  timeline: gsap.core.Timeline,
  task: WeekTask,
  landing: Landing | undefined,
): void {
  const at = SWEEP.start + sweepAt(task) * (SWEEP.end - SWEEP.start);
  const block = `[data-week-task='${task.id}']`;
  const flightAt = at + FLIGHT.delay;
  timeline.to(
    `${block} [data-week-done]`,
    { opacity: 1, duration: TICK_SPAN, ease: ease.standard },
    at,
  );
  /* The words stay in the week: only a band without text travels, and the journal line carries the text. */
  timeline.to(
    `${block} [data-week-label]`,
    { opacity: 0, duration: FLIGHT.span / 3, ease: ease.inOut },
    flightAt,
  );
  if (landing !== undefined) {
    fly(timeline, { block, landing, at: flightAt });
    timeline.to(
      "[data-week-log]",
      { y: -landing.shift, duration: FLIGHT.span, ease: ease.inOut },
      flightAt,
    );
  }
  timeline.to(
    `[data-week-free='${task.id}']`,
    { opacity: 1, duration: ROW.span, ease: ease.standard },
    flightAt + FLIGHT.span / 3,
  );
  timeline.to(
    `[data-week-row='${task.id}']`,
    { opacity: 1, duration: ROW.span, ease: ease.standard },
    at + ROW.delay,
  );
}

function swapWord(timeline: gsap.core.Timeline): void {
  timeline.to(
    "[data-week-word='before']",
    { opacity: 0, yPercent: -WORD_TRAVEL, duration: WORD.span / 2, ease: ease.inOut },
    WORD.at,
  );
  timeline.fromTo(
    "[data-week-word='after']",
    { opacity: 0, yPercent: WORD_TRAVEL },
    { opacity: 1, yPercent: 0, duration: WORD.span / 2, ease: ease.standard },
    WORD.at + WORD.span / 2,
  );
}

/* « La semaine rendue »: the painted week is full; the agent's line sweeps it from Monday to Friday at the pace of the
   scroll while the light drifts on the wall, each routine it meets is ticked and lands in the journal, its slot shows
   as free time, then the one approval waiting on a person arrives and the headline's last word turns from the week
   to time. `root` is the hero's: the week is measured once, when the timeline is built. */
export function weekChoreography(
  tasks: readonly WeekTask[],
  root: HTMLElement | null,
): (timeline: gsap.core.Timeline) => void {
  const routines = routinesOf(tasks);
  return (timeline) => {
    const measure = measureWeek(
      root,
      routines.map((task) => task.id),
    );
    timeline.to(
      "[data-week-idle]",
      { opacity: 0, duration: IDLE_OUT.span, ease: ease.inOut },
      IDLE_OUT.at,
    );
    timeline.to(
      "[data-week-sweep-line]",
      { x: measure.sweep, duration: SWEEP.end - SWEEP.start, ease: "none" },
      SWEEP.start,
    );
    timeline.to(
      "[data-week-light]",
      { xPercent: LIGHT_DRIFT, duration: SWEEP.end - SWEEP.start, ease: "none" },
      SWEEP.start,
    );
    for (const task of routines) {
      takeRoutine(timeline, task, measure.landings.get(task.id));
    }
    timeline.to(
      "[data-week-sweep-line]",
      { opacity: 0, duration: LINE_OUT.span, ease: ease.inOut },
      LINE_OUT.at,
    );
    timeline.to(
      "[data-week-approval]",
      { opacity: 1, duration: APPROVAL.span, ease: ease.standard },
      APPROVAL.at,
    );
    swapWord(timeline);
    /* The last screen rests on the week given back. */
    timeline.set({}, {}, 1);
  };
}
