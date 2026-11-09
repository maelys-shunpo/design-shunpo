import { describe, expect, it } from "vitest";

import { coverScale, cutTurn, nightClip, starPoints } from "../src/motion/shuriken-geometry.ts";

describe("starPoints", () => {
  it("draws the brand shuriken around its centre, 100 px across at scale 1", () => {
    const [top, , right] = starPoints(1, 0, [0, 0]);

    expect(top?.[0]).toBeCloseTo(0);
    expect(top?.[1]).toBeCloseTo(-49.31);
    expect(right?.[0]).toBeCloseTo(49.31);
  });

  it("turns with the scroll", () => {
    const [top] = starPoints(1, 90, [0, 0]);

    expect(top?.[0]).toBeCloseTo(49.31);
    expect(top?.[1]).toBeCloseTo(0);
  });
});

describe("cutTurn", () => {
  it("turns three eighths over the cut, most of it early", () => {
    expect(cutTurn(0)).toBe(0);
    expect(cutTurn(0.5)).toBeGreaterThan(100);
    expect(cutTurn(1)).toBe(135);
  });
});

describe("coverScale", () => {
  it("finds the smallest star that hides the whole screen once turned", () => {
    const scale = coverScale(1440, 900, 135);
    const star = starPoints(scale * 1.01, 135, [720, 450]);
    const smaller = starPoints(scale * 0.95, 135, [720, 450]);

    expect(scale).toBeGreaterThan(14);
    expect(star.length).toBe(8);
    expect(smaller.length).toBe(8);
    expect(coverScale(390, 844, 135)).toBeLessThan(scale);
  });
});

describe("nightClip", () => {
  const shape = { card: { width: 600, height: 200 }, corner: 14, scale: 0.1, degrees: 0 };

  it("starts as a centred card with a cut corner, the shuriken cut out of its middle", () => {
    const clip = nightClip(1000, 600, { ...shape, enter: 0 });

    expect(clip.startsWith('path(evenodd,"M200.00 200.00L786.00 200.00L800.00 214.00')).toBe(true);
    expect(clip).toContain("Z M500.00 295.07");
  });

  it("ends as the whole screen", () => {
    expect(nightClip(1000, 600, { ...shape, enter: 1 })).toContain(
      "M0.00 0.00L1000.00 0.00L1000.00 0.00L1000.00 600.00L0.00 600.00Z",
    );
  });
});
