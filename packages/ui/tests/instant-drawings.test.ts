import { describe, expect, it } from "vitest";

import { buildDrawings, DRAWING_COUNT } from "../src/scene/instant-drawings.ts";
import { layoutFor } from "../src/scene/instant-points.ts";
import type { Drawing, Point } from "../src/scene/instant-shapes.ts";
import { disc, polygon, rect, sample, unit } from "../src/scene/instant-shapes.ts";

const COUNT = 4096;
const drawings = buildDrawings(COUNT);

function largestExtent(points: Float32Array): number {
  return points.reduce((largest, value) => Math.max(largest, Math.abs(value)), 0);
}

function xOf(drawing: Drawing, index: number): number {
  return drawing.points.at(index * 2) ?? Number.NaN;
}

function redShare(drawing: Drawing): number {
  return drawing.red.reduce((sum, value) => sum + value, 0) / drawing.red.length;
}

function shareLeftOfZero(points: Float32Array, count: number): number {
  return (
    Array.from({ length: count }, (_, index) => points.at(index * 2) ?? 0).filter((x) => x < 0)
      .length / count
  );
}

function cornerDistance(primitives: ReturnType<typeof polygon>): number {
  const point: Point = primitives.at(0)?.pick(1, 0.5) ?? [Number.NaN, Number.NaN];
  return Math.hypot(...point);
}

function first(): Drawing {
  return drawings.at(0) ?? { points: new Float32Array(), red: new Float32Array() };
}

function last(): Drawing {
  return drawings.at(-1) ?? { points: new Float32Array(), red: new Float32Array() };
}

describe("Instant drawings", () => {
  it("draws four frames of the same particles", () => {
    expect(drawings).toHaveLength(DRAWING_COUNT);
    expect(drawings.map((drawing) => drawing.points.length)).toEqual(
      Array.from({ length: DRAWING_COUNT }, () => COUNT * 2),
    );
  });

  it("keeps every point inside the shared frame", () => {
    expect(
      Math.max(...drawings.map((drawing) => largestExtent(drawing.points))),
    ).toBeLessThanOrEqual(1.05);
  });

  it("gives the same drawings on every load, so the poster stays true", () => {
    expect(buildDrawings(COUNT).at(0)?.points).toEqual(first().points);
  });

  it("keeps each particle in the same region from drawing to drawing", () => {
    expect(drawings.map((drawing) => xOf(drawing, 0) < -0.5)).toEqual([true, true, true, true]);
    expect(drawings.map((drawing) => xOf(drawing, COUNT - 1) > 0.5)).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });

  it("inks only the seal of the last drawing in red, with most of the ink", () => {
    expect(redShare(first())).toBe(0);
    expect(redShare(last())).toBeCloseTo(0.6, 2);
  });
});

describe("Instant primitives", () => {
  it("spreads points by area across the primitives of a group", () => {
    const { points } = sample(
      [{ share: 1, primitives: [rect([-1, -1, 1, 2]), rect([0, -1, 1, 0.5])] }],
      1000,
      3,
    );

    expect(shareLeftOfZero(points, 1000)).toBeCloseTo(0.8, 1);
  });

  it("keeps ring and polygon points within their radii", () => {
    expect(Math.hypot(...disc([0, 0], 0.5, 0.3).pick(0, 0.25))).toBeCloseTo(0.3, 5);
    expect(cornerDistance(polygon([0, 0], 0.5, 6))).toBeLessThanOrEqual(0.5);
  });

  it("derives values in [0, 1) from an index", () => {
    expect(unit(7, 1)).toBeGreaterThanOrEqual(0);
    expect(unit(7, 1)).toBeLessThan(1);
  });
});

describe("Instant layout", () => {
  it("sets the drawing right of the copy in landscape", () => {
    const aspect = 1440 / 900;
    const [x, , scale] = layoutFor(aspect);

    expect(x - scale / aspect).toBeGreaterThan(-0.25);
    expect(x + scale / aspect).toBeLessThanOrEqual(0.9);
  });

  it("sets the drawing in the upper half in portrait", () => {
    const [x, y, scale] = layoutFor(390 / 844);

    expect(x).toBe(0);
    expect(y - scale).toBeGreaterThan(0.25);
  });
});
