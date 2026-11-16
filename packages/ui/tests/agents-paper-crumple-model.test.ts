import { describe, expect, it } from "vitest";

import {
  addCrumple,
  type CrumpleState,
  MAX_CRUMPLES,
  pointerToSheetUv,
  type SpringState,
  stepSpring,
} from "../src/agents/paper-crumple-model.ts";

const SPRING = { stiffness: 120, damping: 18, dt: 1 / 60 };

describe("stepSpring", () => {
  it("moves toward the target and settles there", () => {
    let s: SpringState = { value: 0, velocity: 0 };
    for (let i = 0; i < 600; i++) {
      s = stepSpring(s, 1, SPRING);
    }
    expect(s.value).toBeCloseTo(1, 2);
    expect(s.velocity).toBeCloseTo(0, 2);
  });

  it("stays put when already at the target with no velocity", () => {
    const s = stepSpring({ value: 1, velocity: 0 }, 1, SPRING);
    expect(s.value).toBeCloseTo(1, 5);
    expect(s.velocity).toBeCloseTo(0, 5);
  });
});

describe("addCrumple", () => {
  it("adds creases and counts up", () => {
    const next = addCrumple({ count: 0, creases: [] }, { u: 0.5, v: 0.5 }, 1);
    expect(next.count).toBe(1);
    expect(next.creases.length).toBeGreaterThan(0);
  });

  it("is deterministic for a seed", () => {
    const a = addCrumple({ count: 0, creases: [] }, { u: 0.4, v: 0.6 }, 7);
    const b = addCrumple({ count: 0, creases: [] }, { u: 0.4, v: 0.6 }, 7);
    expect(a.creases).toEqual(b.creases);
  });

  it("stops at MAX_CRUMPLES and keeps the crease list bounded", () => {
    let s: CrumpleState = { count: 0, creases: [] };
    for (let i = 0; i < 20; i++) {
      s = addCrumple(s, { u: 0.5, v: 0.5 }, i);
    }
    expect(s.count).toBe(MAX_CRUMPLES);
    const capped = addCrumple(s, { u: 0.5, v: 0.5 }, 99);
    expect(capped).toBe(s);
  });
});

describe("pointerToSheetUv", () => {
  const rect = { left: 100, top: 50, width: 200, height: 400 };

  it("maps a point inside to UV in [0,1]", () => {
    expect(pointerToSheetUv({ x: 200, y: 250 }, rect)).toEqual({ u: 0.5, v: 0.5 });
  });

  it("is null outside the sheet", () => {
    expect(pointerToSheetUv({ x: 50, y: 250 }, rect)).toBeNull();
    expect(pointerToSheetUv({ x: 200, y: 500 }, rect)).toBeNull();
  });
});
