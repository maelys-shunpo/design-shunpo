import { describe, expect, it } from "vitest";

import {
  phaseStarts,
  questionLeave,
  tickedAt,
  WHEEL_HOLD,
  wheelProgress,
} from "../src/agents/method-wheel-course.ts";
import { wheelCourse } from "../src/lib/wheel-geometry.ts";

describe("questionLeave", () => {
  it("holds the question alone for a quarter screen", () => {
    expect(questionLeave(0)).toEqual({ opacity: 1, rise: -0 });
    expect(questionLeave(0.25)).toEqual({ opacity: 1, rise: -0 });
  });

  it("then lifts it 48 px and fades it, accelerating, over 0.4 screen", () => {
    const halfway = questionLeave(0.45);

    expect(halfway.opacity).toBeGreaterThan(0.5);
    expect(halfway.rise).toBeGreaterThan(-24);
    expect(questionLeave(0.65)).toEqual({ opacity: 0, rise: -48 });
    expect(questionLeave(WHEEL_HOLD)).toEqual({ opacity: 0, rise: -48 });
  });
});

describe("wheelProgress", () => {
  it("starts the stroke a tenth of a screen into the question's exit", () => {
    expect(wheelProgress(0.35)).toBe(0);
    expect(wheelProgress(0.4)).toBeGreaterThan(0);
  });

  it("ends the course before the hold does, so the last phase holds complete", () => {
    expect(wheelProgress(WHEEL_HOLD - 0.25)).toBe(1);
    expect(wheelProgress(WHEEL_HOLD)).toBe(1);
  });
});

describe("phaseStarts", () => {
  it("names each phase where the wheel names it", () => {
    const starts = phaseStarts(3);

    expect(starts).toHaveLength(3);
    for (const [phase, start] of starts.entries()) {
      expect(wheelCourse(start, 3).active).toBe(phase);
      expect(wheelCourse(start - 0.001, 3).active).toBeLessThan(phase);
    }
  });
});

describe("tickedAt", () => {
  const starts = phaseStarts(3);
  const [first = 0, second = 0, third = 0] = starts;

  it("ticks nothing as a phase is named and everything a third of the way to the next", () => {
    const span = second - first;

    expect(tickedAt({ progress: first, starts, phase: 0, deliverables: 3 })).toBe(0);
    expect(tickedAt({ progress: first + span * 0.1, starts, phase: 0, deliverables: 3 })).toBe(1);
    expect(tickedAt({ progress: first + span * 0.2, starts, phase: 0, deliverables: 3 })).toBe(2);
    expect(tickedAt({ progress: first + span * 0.35, starts, phase: 0, deliverables: 3 })).toBe(3);
    expect(tickedAt({ progress: second - 0.001, starts, phase: 0, deliverables: 3 })).toBe(3);
  });

  it("has every deliverable ticked while the phase still rests, before the next morph", () => {
    expect(wheelCourse(first + (second - first) * 0.35, 3).travel).toBe(0);
    expect(wheelCourse(second + (third - second) * 0.35, 3).travel).toBe(1);
  });

  it("ticks the last phase by a third of the rest of the course", () => {
    expect(tickedAt({ progress: third, starts, phase: 2, deliverables: 3 })).toBe(0);
    expect(
      tickedAt({ progress: third + (1 - third) * 0.35, starts, phase: 2, deliverables: 3 }),
    ).toBe(3);
    expect(tickedAt({ progress: 1, starts, phase: 2, deliverables: 3 })).toBe(3);
  });

  it("ticks nothing while no phase is named", () => {
    expect(tickedAt({ progress: 0.1, starts, phase: -1, deliverables: 0 })).toBe(0);
  });
});
