import { LANDING } from "../lib/wheel-geometry.ts";

/* Where the method wheel's course falls in its paper film. The scroll carries the paper from one phase's pose to the
   next, done folding the moment the next phase is named; while the wheel rests on a phase, a short idle loop plays in
   time, whatever the scroll does. */

/* A phase's idle loop: after `delay` seconds of rest, the stretch from `from` to `to` plays over `seconds`, then holds
   `hold` seconds on `to`, again and again. `repeat` plays footage that starts and ends on the pose (the thread retied,
   the breeze); `bounce` goes back to `from` and forth again, eased (the red brick tapped into place). */
export interface FilmLoop {
  from: number;
  to: number;
  seconds: number;
  hold: number;
  delay: number;
  motion: "repeat" | "bounce";
}

/* A phase's entrance: footage from `from` to `to` (its pose) played once over `seconds` as the phase comes in from
   before it (Immersion from the question), before its loop. */
export interface FilmEntrance {
  from: number;
  to: number;
  seconds: number;
}

/* A phase in the film: the frame the scroll sets it on and takes it from, its entrance and its idle loop. */
export interface FilmRest {
  pose: number;
  entrance?: FilmEntrance | undefined;
  loop?: FilmLoop | undefined;
}

/* The wheel's course as the film reads it: how far the dots have travelled (0 on the first dot, 1 on the second…) and
   the phase currently named (-1 while the question stands alone). */
export interface CourseValue {
  travel: number;
  active: number;
}

/* Share of a step over which a loop caught mid-way fades into the moving paper. */
const DEPARTURE_SHARE = 0.15;
/* Share of a step the dot travels before the paper starts folding: the dot sets off, the loop fades, then the fold. */
const FOLD_START = 0.1;

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

function smoothstep(value: number): number {
  const share = clamp(value, 0, 1);
  return share * share * (3 - 2 * share);
}

/* The film's frame (fractional) the scroll asks for: from one phase's pose to the next, the paper folding once the dot
   has set off and done as the wheel names the next phase (its dot landing), still for the rest of the dot's way. */
export function filmPosition(travel: number, rests: readonly FilmRest[]): number {
  const last = rests.length - 1;
  const step = clamp(Math.floor(travel), 0, Math.max(last - 1, 0));
  const share = clamp((travel - step - FOLD_START) / (LANDING - FOLD_START), 0, 1);
  const from = rests[step]?.pose ?? 0;
  const to = rests[Math.min(step + 1, last)]?.pose ?? from;
  return from + (to - from) * share;
}

/* Where a phase's idle loop is after `elapsed` seconds: on its pose through the delay and every hold; footage played at
   its own pace when it repeats, an eased tap back and forth when it bounces. */
function idlePosition(pose: number, loop: FilmLoop | undefined, elapsed: number): number {
  const time = elapsed - (loop?.delay ?? 0);
  if (loop === undefined || loop.seconds <= 0 || time < 0) {
    return pose;
  }
  const { from, to, seconds, hold, motion } = loop;
  const legs = motion === "bounce" ? 2 : 1;
  const within = time % (legs * seconds + hold);
  if (within >= legs * seconds) {
    return to;
  }
  if (motion === "repeat") {
    return from + ((to - from) * within) / seconds;
  }
  const away = within < seconds ? within / seconds : 2 - within / seconds;
  return to + (from - to) * smoothstep(away);
}

/* Where a phase's paper is after `elapsed` seconds of rest: its entrance first when it comes in from before it
   (footage at its own pace), then its idle loop. */
export function loopPosition(rest: FilmRest, elapsed: number, entering = false): number {
  const { pose, entrance, loop } = rest;
  if (!entering || entrance === undefined) {
    return idlePosition(pose, loop, elapsed);
  }
  if (elapsed < entrance.seconds) {
    return entrance.from + ((entrance.to - entrance.from) * elapsed) / entrance.seconds;
  }
  return idlePosition(pose, loop, elapsed - entrance.seconds);
}

/* How much of a loop caught mid-way still shows as the dots set off, forward or back: all of it at the dot, none a
   little way on. */
export function departureWeight(travel: number): number {
  const fromDot = Math.abs(travel - Math.round(travel));
  return 1 - smoothstep(fromDot / DEPARTURE_SHARE);
}

/* The phase whose loop plays: the one named, while the wheel rests exactly on its dot. */
export function restingPhase({ travel, active }: CourseValue): number | undefined {
  return Number.isInteger(travel) && travel === active ? travel : undefined;
}

/* A value handed from one part of the wheel to another (its course, its pause), to late listeners too. */
export function createSignal<Value>(initial: Value) {
  let value = initial;
  const listeners = new Set<(next: Value) => void>();
  return {
    set: (next: Value) => {
      value = next;
      for (const listener of listeners) {
        listener(next);
      }
    },
    get: () => value,
    listen: (listener: (next: Value) => void) => {
      listeners.add(listener);
      listener(value);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type Signal<Value> = ReturnType<typeof createSignal<Value>>;
export type CourseSignal = Signal<CourseValue>;

export function createCourseSignal(): CourseSignal {
  return createSignal<CourseValue>({ travel: 0, active: -1 });
}
