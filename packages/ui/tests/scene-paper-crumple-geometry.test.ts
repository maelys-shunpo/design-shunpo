import { describe, expect, it } from "vitest";

import {
  buildCrumpleGeometry,
  CREASE_UNIFORM_SLOTS,
  packCreases,
} from "../src/scene/paper-crumple-geometry.ts";

describe("buildCrumpleGeometry", () => {
  it("subdivides the plane and gives more segments on higher tiers", () => {
    const light = buildCrumpleGeometry("light");
    const full = buildCrumpleGeometry("full");
    expect(full.segments).toBeGreaterThan(light.segments);
    expect(light.segments).toBeGreaterThanOrEqual(1);
    light.geometry.dispose();
    full.geometry.dispose();
  });
});

describe("packCreases", () => {
  it("packs creases into the fixed-size shader array without overflow", () => {
    const packed = packCreases(
      Array.from({ length: 50 }, () => ({ u: 0.5, v: 0.5, angle: 0, depth: 1 })),
    );
    expect(packed.length).toBe(CREASE_UNIFORM_SLOTS);
  });

  it("zeroes the unused slots when there are few creases", () => {
    const packed = packCreases([{ u: 0.5, v: 0.5, angle: 1, depth: 1 }]);
    expect(packed.length).toBe(CREASE_UNIFORM_SLOTS);
    expect(packed[0]).toMatchObject({ x: 0.5, y: 0.5 });
    expect(packed[CREASE_UNIFORM_SLOTS - 1]).toMatchObject({ x: 0, y: 0, z: 0, w: 0 });
  });
});
