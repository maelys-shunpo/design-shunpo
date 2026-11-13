import { describe, expect, it } from "vitest";

import { BRANCH, branchPattern, LOGO, starOutline } from "../src/scene/agents-shuriken-pattern.ts";

const RADIANS_TO_DEGREES = 180 / Math.PI;

function distance([x, y]: readonly [number, number]): number {
  return Math.hypot(x, y);
}

function toTip([x, y]: readonly [number, number]): number {
  return Math.hypot(x, y - 1);
}

/* The flap's free corner lands across its fold line, mirrored. */
function landed(): readonly [number, number] {
  const [ax, ay] = BRANCH.tip;
  const [fx, fy] = BRANCH.flapLeft;
  const [dx, dy] = [BRANCH.valleyLeft[0] - ax, BRANCH.valleyLeft[1] - ay];
  const length = Math.hypot(dx, dy);
  const [ux, uy] = [dx / length, dy / length];
  const along = (fx - ax) * ux + (fy - ay) * uy;
  return [2 * (ax + along * ux) - fx, 2 * (ay + along * uy) - fy];
}

describe("The folded SHUNPO sign", () => {
  it("reaches its four points at one unit from the centre", () => {
    const [top, , right, , bottom, , left] = starOutline();

    expect([top, right, bottom, left].map((tip) => distance(tip))).toEqual([
      expect.closeTo(1, 6),
      expect.closeTo(1, 6),
      expect.closeTo(1, 6),
      expect.closeTo(1, 6),
    ]);
    expect(right[0]).toBeCloseTo(1, 6);
  });

  it("sets its valleys at the logo's share of a point", () => {
    const [, valley] = starOutline();

    expect(distance(valley)).toBeCloseTo(LOGO.valley, 1);
  });

  it("punches the hole at the logo's share of a point", () => {
    expect(BRANCH.hole).toBeCloseTo(LOGO.hole, 2);
  });

  it("sharpens each point to the logo's sixty degrees", () => {
    const [tipX, tipY] = BRANCH.tip;
    const [valleyX, valleyY] = BRANCH.valleyLeft;
    const half = Math.atan2(Math.abs(valleyX - tipX), Math.abs(valleyY - tipY));

    expect(half * 2 * RADIANS_TO_DEGREES).toBeCloseTo(LOGO.tipDegrees, 6);
  });

  it("starts from a square sheet", () => {
    expect(toTip(BRANCH.flapLeft)).toBeCloseTo(toTip(BRANCH.flapRight), 6);
    expect(distance(BRANCH.flapLeft)).toBeCloseTo(toTip(BRANCH.flapLeft), 6);
  });

  it("folds two flaps over the front and a ridge down the middle", () => {
    const pattern = branchPattern();

    expect(pattern.map(({ id, parent, toward }) => ({ id, parent, toward }))).toEqual([
      { id: "core-left", parent: undefined, toward: undefined },
      { id: "core-right", parent: "core-left", toward: "down" },
      { id: "flap-left", parent: "core-left", toward: "up" },
      { id: "flap-right", parent: "core-right", toward: "up" },
    ]);
  });

  it("leaves the hole clear: no flap reaches the punched corner once folded", () => {
    expect(distance(landed())).toBeGreaterThan(BRANCH.hole + 0.05);
  });
});
