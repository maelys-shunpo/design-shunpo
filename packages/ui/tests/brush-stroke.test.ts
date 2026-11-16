import { describe, expect, it } from "vitest";

import { type BrushStrokeSpec, paintBrushStroke } from "../src/lib/brush-stroke.ts";

const FIRST_Y = 18;

const VERTICAL: BrushStrokeSpec = {
  points: [
    [70, FIRST_Y],
    [76, 230],
    [70, 444],
  ],
  width: 13,
  seed: 300,
};

function coordinates(path: string): number[] {
  return [...path.matchAll(/-?\d+(?:\.\d+)?/gu)].map(([value]) => Number(value));
}

describe("paintBrushStroke", () => {
  it("paints the same stroke for the same seed", () => {
    expect(paintBrushStroke(VERTICAL)).toEqual(paintBrushStroke(VERTICAL));
  });

  it("paints another stroke for another seed", () => {
    expect(paintBrushStroke({ ...VERTICAL, seed: 301 }).body).not.toBe(
      paintBrushStroke(VERTICAL).body,
    );
  });

  it("outlines the wet body as one closed shape", () => {
    const { body } = paintBrushStroke(VERTICAL);

    expect(body).toMatch(/^M/u);
    expect(body).toMatch(/Z$/u);
  });

  it("keeps the ink along the stroke, never far from its line", () => {
    const { body } = paintBrushStroke(VERTICAL);
    const values = coordinates(body);
    const xs = values.filter((_, index) => index % 2 === 0);
    const ys = values.filter((_, index) => index % 2 === 1);

    expect(Math.min(...xs)).toBeGreaterThan(50);
    expect(Math.max(...xs)).toBeLessThan(95);
    expect(Math.min(...ys)).toBeGreaterThan(0);
    expect(Math.max(...ys)).toBeLessThan(450);
  });

  it("breaks into dry bristles, thinner than the brush, toward the tail", () => {
    const { bristles } = paintBrushStroke(VERTICAL);

    expect(bristles.length).toBeGreaterThan(3);
    for (const bristle of bristles) {
      expect(bristle.width).toBeGreaterThan(0);
      expect(bristle.width).toBeLessThan(VERTICAL.width);
      expect(bristle.dashes).toMatch(/^\d/u);
      expect(coordinates(bristle.path)[1]).toBeGreaterThan(200);
    }
  });

  it("leaves pale grooves where the hairs part in the wet ink", () => {
    const { grooves } = paintBrushStroke(VERTICAL);

    expect(grooves.length).toBeGreaterThan(0);
    for (const groove of grooves) {
      expect(groove.opacity).toBeGreaterThan(0);
      expect(groove.opacity).toBeLessThan(0.5);
    }
  });

  it("keeps a stroke on a single point on that point, with no broken coordinate", () => {
    const stroke = paintBrushStroke({ ...VERTICAL, points: [[70, FIRST_Y]] });
    const paths = [
      stroke.body,
      stroke.centre,
      ...stroke.bristles.map((bristle) => bristle.path),
      ...stroke.grooves.map((groove) => groove.path),
    ];

    for (const path of paths) {
      expect(path).toMatch(/^M70 18(?:L70 18)*Z?$/u);
    }
  });

  it("refuses a stroke without points", () => {
    expect(() => paintBrushStroke({ ...VERTICAL, points: [] })).toThrow(
      "A brush stroke needs at least one point.",
    );
  });

  it("reveals along a centre line that starts before the brush lands and covers its press", () => {
    const { centre, revealWidth } = paintBrushStroke(VERTICAL);
    const [, startY] = coordinates(centre);

    expect(startY).toBeLessThan(FIRST_Y);
    expect(revealWidth).toBeGreaterThan(VERTICAL.width * 1.35);
  });
});
