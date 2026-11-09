import { describe, expect, it } from "vitest";

import {
  answerRise,
  courseLength,
  cutProgress,
  cutScale,
  plateFrame,
} from "../src/motion/question-geometry.ts";

describe("courseLength", () => {
  it("pins until the answer's last line has risen and been read", () => {
    expect(courseLength(3)).toBeCloseTo(1.84);
    expect(courseLength(4)).toBeCloseTo(1.93);
  });
});

describe("plateFrame", () => {
  const above = { direction: [0, 1] as const, reach: 120, press: 10 };
  const below = { direction: [0, -1] as const, reach: 120, press: 10 };

  it("waits out of sight, beyond the plate's place, before its turn", () => {
    expect(plateFrame(-0.2, 0, above)).toMatchObject({ y: -120, scale: 1.06, opacity: 0 });
    expect(plateFrame(-0.2, 0, { ...above, direction: [1, 0] }).x).toBe(-120);
  });

  it("settles in place, one plate after the other", () => {
    expect(plateFrame(0.22, 0, above)).toMatchObject({ scale: 1, opacity: 1 });
    expect(plateFrame(0.22, 1, above).opacity).toBeGreaterThan(0);
    expect(plateFrame(0.22, 3, above).opacity).toBe(0);
  });

  it("is drawn closer to the question by each plate that arrives after it", () => {
    expect(plateFrame(0.64, 0, above).y).toBeCloseTo(30);
    expect(plateFrame(0.64, 0, below).y).toBeCloseTo(-30);
    expect(plateFrame(0.64, 3, above).y).toBeCloseTo(0);
  });

  it("dims once the shuriken starts cutting", () => {
    expect(plateFrame(0.64, 0, above).opacity).toBe(1);
    expect(plateFrame(1, 0, above).opacity).toBeCloseTo(0.28);
    expect(plateFrame(1, 3, above).opacity).toBeCloseTo(0.28);
  });
});

describe("cutProgress", () => {
  it("cuts over one screen once the plates have settled", () => {
    expect(cutProgress(0.5)).toBe(0);
    expect(cutProgress(0.965)).toBeCloseTo(0.5);
    expect(cutProgress(2)).toBe(1);
  });
});

describe("cutScale", () => {
  const screen = { width: 1440, height: 900, cover: 20 };

  it("starts as a point in the middle of the question", () => {
    expect(cutScale(0, screen)).toBeCloseTo(0.04);
  });

  it("is a 240 px shuriken a third of the way, smaller on a phone", () => {
    expect(cutScale(0.35, screen)).toBeCloseTo(2.4);
    expect(cutScale(0.35, { width: 390, height: 844, cover: 12 })).toBeCloseTo(1.482);
  });

  it("never shrinks on the way, even when the screen is barely larger than the mark", () => {
    const small = { width: 1440, height: 900, cover: 3 };
    const scales = [0, 0.2, 0.35, 0.5, 0.8, 1].map((progress) => cutScale(progress, small));

    expect(scales).toEqual(scales.toSorted((first, second) => first - second));
    expect(scales.at(-1)).toBeCloseTo(3);
  });

  it("holds on the mark when the screen is smaller than it", () => {
    const tiny = { width: 1440, height: 900, cover: 2 };

    expect(cutScale(0.35, tiny)).toBeCloseTo(2.4);
    expect(cutScale(1, tiny)).toBeCloseTo(2);
  });

  it("grows all the way until the night is gone", () => {
    expect(cutScale(1, screen)).toBeCloseTo(20);
    expect(cutScale(0.6, screen)).toBeGreaterThan(cutScale(0.5, screen));
  });
});

describe("answerRise", () => {
  it("raises the lines one after the other once the night is nearly gone", () => {
    expect(answerRise(1.1, 0)).toBe(0);
    expect(answerRise(1.31, 0)).toBe(1);
    expect(answerRise(1.31, 1)).toBeGreaterThan(0);
    expect(answerRise(1.31, 2)).toBe(0);
  });
});
