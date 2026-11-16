import { describe, expect, it } from "vitest";

import { entryAngle, wheelGeometry, wheelPoint } from "../src/lib/wheel-geometry.ts";
import { stepPitch, tipDistance, wheelTrail } from "../src/lib/wheel-trail.ts";

/* The artifact's 1 440 × 900 frame: the drop rests 420 px from the left, at mid-height. */
const FRAME = wheelGeometry({ height: 900, dotX: 420 });
const PITCH = 456;
const REST_Y = 454.5;
const TRAIL = wheelTrail(FRAME, { phases: 3, pitch: PITCH });

function direction(from: readonly [number, number], to: readonly [number, number]): number {
  return (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
}

/* Where the stroke passes through the rest point. */
function restIndex(): number {
  return TRAIL.points.findIndex(([x, y]) => Math.hypot(x - 420, y - REST_Y) < 0.01);
}

function pointAt(index: number): readonly [number, number] {
  const [x = Number.NaN, y = Number.NaN] = TRAIL.points[index] ?? [];
  return [x, y];
}

/* How much the stroke's direction changes at a point of its centre line, in degrees. */
function turnAt(index: number): number {
  return Math.abs(
    direction(pointAt(index - 1), pointAt(index)) - direction(pointAt(index), pointAt(index + 1)),
  );
}

describe("wheelTrail", () => {
  it("starts where the arc enters the screen and reaches the rest point along the wheel", () => {
    const entry = wheelPoint(FRAME, entryAngle(FRAME));
    const rest = wheelPoint(FRAME, 0);

    expect(TRAIL.points[0]?.[0]).toBeCloseTo(entry.x);
    expect(TRAIL.points[0]?.[1]).toBeCloseTo(entry.y);
    expect(TRAIL.drops[0]?.x).toBeCloseTo(rest.x);
    expect(TRAIL.drops[0]?.y).toBeCloseTo(rest.y);
    expect(restIndex()).toBeGreaterThan(0);
  });

  it("sets each next drop one pitch below the last, on the rest point's vertical", () => {
    expect(TRAIL.drops).toHaveLength(3);
    for (const [index, drop] of TRAIL.drops.entries()) {
      expect(drop.x).toBeCloseTo(420);
      expect(drop.y).toBeCloseTo(REST_Y + index * PITCH);
    }
  });

  it("goes on past the last drop by a third of a pitch", () => {
    expect(TRAIL.points.at(-1)?.[1]).toBeCloseTo(REST_Y + 2 * PITCH + 0.35 * PITCH);
  });

  it("joins the arc without a kink", () => {
    expect(turnAt(restIndex())).toBeLessThan(2);
  });

  it("sways away from the copy between two drops, by 22 px at most", () => {
    const below = TRAIL.points.filter(([, y]) => y > REST_Y);
    const between = below.filter(([, y]) => y < REST_Y + PITCH);

    expect(Math.max(...below.map(([x]) => x))).toBeLessThanOrEqual(420.01);
    expect(Math.min(...between.map(([x]) => x))).toBeCloseTo(420 - 22, 0);
  });

  it("measures each drop along the stroke, in order", () => {
    const [first = 0, second = 0, third = 0] = TRAIL.marks;
    const arc = (FRAME.radius * Math.abs(entryAngle(FRAME)) * Math.PI) / 180;

    expect(second).toBeGreaterThan(first);
    expect(third).toBeGreaterThan(second);
    expect(Math.abs(first - arc) / arc).toBeLessThan(0.02);
    expect(TRAIL.length).toBeGreaterThan(third);
  });

  it("brings the tip down the arc, then one drop per step", () => {
    const [first = 0, second = 0, third = 0] = TRAIL.marks;

    expect(tipDistance(TRAIL, 0, 0)).toBe(0);
    expect(tipDistance(TRAIL, 0.5, 0)).toBeCloseTo(first / 2);
    expect(tipDistance(TRAIL, 1, 1)).toBeCloseTo(second);
    expect(tipDistance(TRAIL, 1, 1.5)).toBeGreaterThan(second);
    expect(tipDistance(TRAIL, 1, 1.5)).toBeLessThan(third);
    expect(tipDistance(TRAIL, 1, 2)).toBe(third);
  });
});

describe("stepPitch", () => {
  it("keeps two copies apart on a short screen", () => {
    expect(stepPitch(380, 600)).toBe(476);
    expect(stepPitch(200, 1000)).toBe(500);
  });
});
