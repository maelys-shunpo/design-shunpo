import { describe, expect, it } from "vitest";

import {
  balanceShape,
  bridgeShape,
  plateShape,
  spiralPoints,
  wheelOutline,
  wheelShape,
} from "../src/scene/mecanique-geometry.ts";

function radiusOf([x, y]: [number, number]): number {
  return Math.hypot(x, y);
}

describe("calibre geometry", () => {
  it("draws four points a tooth on a train wheel, between its root and its tip", () => {
    const outline = wheelOutline({ teeth: 48, radius: 0.2, toothDepth: 0.02, spokes: 4 });

    expect(outline).toHaveLength(48 * 4);
    for (const point of outline) {
      expect(radiusOf(point)).toBeGreaterThanOrEqual(0.18 - 1e-9);
      expect(radiusOf(point)).toBeLessThanOrEqual(0.2 + 1e-9);
    }
  });

  it("draws leaning club teeth, three points each, on the escape wheel", () => {
    const outline = wheelOutline({
      teeth: 15,
      radius: 0.12,
      toothDepth: 0.03,
      spokes: 4,
      profile: "club",
    });

    expect(outline).toHaveLength(15 * 3);
  });

  it("pierces a wheel with one window per arm and its arbor hole", () => {
    expect(wheelShape({ teeth: 30, radius: 0.3, toothDepth: 0.02, spokes: 5 }).holes).toHaveLength(
      6,
    );
    expect(wheelShape({ teeth: 12, radius: 0.1, toothDepth: 0.02, spokes: 0 }).holes).toHaveLength(
      1,
    );
  });

  it("cuts the plate's recesses, the bridge's screw holes and the balance's two windows", () => {
    expect(plateShape(1, [{ x: 0, y: 0, radius: 0.2 }]).holes).toHaveLength(1);
    expect(bridgeShape([0, 0], [1, 0], 0.2).holes).toHaveLength(2);
    expect(balanceShape(0.27, 0.045).holes).toHaveLength(2);
  });

  it("winds the hairspring outward from its collet to its stud", () => {
    const spiral = spiralPoints({ turns: 9, inner: 0.03, outer: 0.17, steps: 360 });

    const radii = spiral.map((point) => radiusOf(point));

    expect(radii).toHaveLength(361);
    expect(radii[0]).toBeCloseTo(0.03);
    expect(radii[360]).toBeCloseTo(0.17);
  });
});
