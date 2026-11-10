import { describe, expect, it } from "vitest";

import {
  createCourseSignal,
  createSignal,
  departureWeight,
  filmPosition,
  loopPosition,
  restingPhase,
} from "../src/agents/wheel-film-course.ts";

/* Immersion's footage loops over frames 0 to 10 and rests on 10; Construction rests on 40 and taps its brick down
   from 36; Évolution rests on 80 and has no loop. */
const immersion = {
  pose: 10,
  loop: { from: 0, to: 10, seconds: 4, hold: 2, delay: 1, motion: "repeat" as const },
};
const construction = {
  pose: 40,
  loop: { from: 36, to: 40, seconds: 1, hold: 2, delay: 0, motion: "bounce" as const },
};
const evolution = { pose: 80 };
const rests = [immersion, construction, evolution];

describe("filmPosition", () => {
  it("folds the paper from one pose to the next once the dot has set off, done as the next phase is named", () => {
    expect(filmPosition(0.1, rests)).toBe(10);
    expect(filmPosition(0.475, rests)).toBe(25);
    expect(filmPosition(0.85, rests)).toBe(40);
    expect(filmPosition(0.95, rests)).toBe(40);
    expect(filmPosition(1.475, rests)).toBe(60);
  });

  it("stands on a phase's pose on its dot, and never leaves the film", () => {
    expect(filmPosition(1, rests)).toBe(40);
    expect(filmPosition(-1, rests)).toBe(10);
    expect(filmPosition(2, rests)).toBe(80);
    expect(filmPosition(3, rests)).toBe(80);
  });
});

describe("loopPosition", () => {
  it("holds the pose through the delay, then plays footage at its own pace", () => {
    expect(loopPosition(immersion, 0.5)).toBe(10);
    expect(loopPosition(immersion, 1)).toBe(0);
    expect(loopPosition(immersion, 3)).toBe(5);
  });

  it("holds the pose between two plays", () => {
    expect(loopPosition(immersion, 5.5)).toBe(10);
    expect(loopPosition(immersion, 7)).toBe(0);
  });

  it("taps back and forth, eased, when it bounces", () => {
    expect(loopPosition(construction, 0)).toBe(40);
    expect(loopPosition(construction, 0.5)).toBe(38);
    expect(loopPosition(construction, 1)).toBe(36);
    expect(loopPosition(construction, 1.5)).toBe(38);
    expect(loopPosition(construction, 3)).toBe(40);
  });

  it("plays the entrance first when the phase comes in from before it, then its loop", () => {
    const entered = { ...immersion, entrance: { from: 100, to: 110, seconds: 2 } };

    expect(loopPosition(entered, 0, true)).toBe(100);
    expect(loopPosition(entered, 1, true)).toBe(105);
    expect(loopPosition(entered, 2.5, true)).toBe(10);
    expect(loopPosition(entered, 3, true)).toBe(0);
    expect(loopPosition(entered, 1, false)).toBe(0);
  });

  it("stays on the pose of a phase without a loop", () => {
    expect(loopPosition(evolution, 12)).toBe(80);
  });
});

describe("departureWeight", () => {
  it("fades a loop caught mid-way into the moving paper over the first stretch of a step, either way", () => {
    expect(departureWeight(1)).toBe(1);
    expect(departureWeight(1.075)).toBeCloseTo(0.5);
    expect(departureWeight(1.2)).toBe(0);
    expect(departureWeight(0.925)).toBeCloseTo(0.5);
  });
});

describe("restingPhase", () => {
  it("names the phase the wheel rests on, once it is named", () => {
    expect(restingPhase({ travel: 1, active: 1 })).toBe(1);
    expect(restingPhase({ travel: 0, active: -1 })).toBeUndefined();
    expect(restingPhase({ travel: 1.2, active: 1 })).toBeUndefined();
  });
});

describe("createSignal", () => {
  it("hands a value to every listener, and to late ones at once", () => {
    const paused = createSignal(false);
    const heard: boolean[] = [];
    paused.set(true);
    const stop = paused.listen((value) => {
      heard.push(value);
    });
    paused.set(false);
    stop();
    paused.set(true);

    expect(heard).toEqual([true, false]);
    expect(paused.get()).toBe(true);
    expect(createCourseSignal().get()).toEqual({ travel: 0, active: -1 });
  });
});
