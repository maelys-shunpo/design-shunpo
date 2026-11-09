import { describe, expect, it } from "vitest";

import {
  arcPoints,
  entryAngle,
  wheelCourse,
  wheelGeometry,
  wheelPoint,
} from "../src/lib/wheel-geometry.ts";

/* The artifact's 1 440 × 900 frame: the red dot rests 420 px from the left, at mid-height. */
const FRAME = wheelGeometry({ height: 900, dotX: 420 });

describe("wheelGeometry", () => {
  it("draws a wide circle whose rightmost point is the resting dot", () => {
    expect(FRAME.radius).toBeCloseTo(702);
    expect(wheelPoint(FRAME, 0).x).toBeCloseTo(420);
    expect(wheelPoint(FRAME, 0).y).toBeCloseTo(454.5);
  });

  it("keeps the circle at least 560 px wide on short screens", () => {
    expect(wheelGeometry({ height: 500, dotX: 300 }).radius).toBe(560);
  });
});

describe("entryAngle", () => {
  it("is where the arc leaves the top of the screen", () => {
    const angle = entryAngle(FRAME);

    expect(wheelPoint(FRAME, angle).y).toBeCloseTo(-24);
  });

  it("stops at 72° above the dot when the arc never reaches the top", () => {
    expect(entryAngle({ radius: 100, centreX: 0, centreY: 500 })).toBe(-72);
  });
});

describe("wheelCourse", () => {
  it("brings the first dot down from the top over the first 22 % of the scroll", () => {
    expect(wheelCourse(0, 3)).toEqual({ entry: 0, travel: 0, active: -1 });
    expect(wheelCourse(0.11, 3).entry).toBeCloseTo(0.5);
    expect(wheelCourse(0.22, 3).entry).toBe(1);
  });

  it("names no step until the first dot has come down to its place", () => {
    expect(wheelCourse(0.15, 3).active).toBe(-1);
    expect(wheelCourse(0.22, 3).active).toBe(0);
  });

  it("holds each step, then draws the dot to the next one", () => {
    const start = 0.22;
    const half = (1 - start) / 2;

    expect(wheelCourse(start + half * 0.1, 3).travel).toBe(0);
    expect(wheelCourse(start + half * 0.5, 3).travel).toBeCloseTo(0.5);
    expect(wheelCourse(start + half * 0.95, 3).travel).toBe(1);
    expect(wheelCourse(1, 3)).toEqual({ entry: 1, travel: 2, active: 2 });
  });

  it("eases the dot out of a step and lands it softly on the next, without a sudden stop", () => {
    const start = 0.22;
    const half = (1 - start) / 2;
    function speed(share: number): number {
      return (
        wheelCourse(start + half * (share + 0.01), 3).travel -
        wheelCourse(start + half * share, 3).travel
      );
    }

    expect(speed(0.15)).toBeLessThan(0.002);
    expect(speed(0.5)).toBeGreaterThan(0.015);
    expect(speed(0.85)).toBeLessThan(0.002);
  });

  it("names the next step only once the dot is landing on it", () => {
    const start = 0.22;
    const half = (1 - start) / 2;

    expect(wheelCourse(start + half * 0.6, 3).active).toBe(0);
    expect(wheelCourse(start + half * 0.8, 3).active).toBe(1);
    expect(wheelCourse(0.5, 3).active).toBe(1);
  });
});

describe("arcPoints", () => {
  it("samples the brush's centre line down the arc, ending on the dot", () => {
    const points = arcPoints(FRAME, -40, 0);
    const dot = wheelPoint(FRAME, 0);

    expect(points.length).toBeGreaterThan(10);
    expect(points.at(-1)?.[0]).toBeCloseTo(dot.x);
    expect(points.at(-1)?.[1]).toBeCloseTo(dot.y);
    expect(points[0]?.[1]).toBeLessThan(dot.y);
  });
});
