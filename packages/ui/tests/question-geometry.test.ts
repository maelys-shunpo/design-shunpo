import { describe, expect, it } from "vitest";

import {
  answerRise,
  courseLength,
  cutProgress,
  cutScale,
  designatedAt,
  inkWordClose,
  inkWordFocus,
  plateFrame,
  questionDim,
  questionHold,
  questionRise,
} from "../src/motion/question-geometry.ts";

describe("courseLength", () => {
  it("pins until the answer's last line has risen and been read", () => {
    expect(courseLength(3)).toBeCloseTo(3.25);
    expect(courseLength(4)).toBeCloseTo(3.34);
  });
});

describe("questionRise", () => {
  it("holds the question in the middle of the night, then raises it to the top before the plates follow", () => {
    expect(questionRise(0)).toBe(0);
    expect(questionRise(0.11)).toBeGreaterThan(0);
    expect(questionRise(0.11)).toBeLessThan(1);
    expect(questionRise(0.22)).toBe(1);
  });
});

describe("plateFrame", () => {
  it("waits out of sight, below its place, while the question rises", () => {
    expect(plateFrame(0.1, 0, 72)).toEqual({ y: 72, scale: 1.06, opacity: 0 });
  });

  it("rises into place under the question, one plate after the other", () => {
    expect(plateFrame(0.36, 0, 72)).toEqual({ y: 0, scale: 1, opacity: 1 });
    expect(plateFrame(0.36, 1, 72).opacity).toBe(0);
    expect(plateFrame(0.5, 1, 72).opacity).toBeGreaterThan(0);
    expect(plateFrame(0.5, 3, 72).opacity).toBe(0);
    expect(plateFrame(1.21, 3, 72)).toEqual({ y: 0, scale: 1, opacity: 1 });
  });

  it("holds all four whole for a reading rest before the cut", () => {
    expect(plateFrame(1.78, 0, 72).opacity).toBe(1);
    expect(plateFrame(1.78, 3, 72).opacity).toBe(1);
  });

  it("dims once the shuriken starts cutting", () => {
    expect(plateFrame(2.46, 0, 72).opacity).toBeCloseTo(0.28);
    expect(plateFrame(2.46, 3, 72).opacity).toBeCloseTo(0.28);
  });
});

describe("cutProgress", () => {
  it("cuts over six tenths of a screen once the plates have been read", () => {
    expect(cutProgress(2.08)).toBe(0);
    expect(cutProgress(2.4)).toBeCloseTo(0.5);
    expect(cutProgress(2.7)).toBe(1);
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
    expect(answerRise(2.5, 0)).toBe(0);
    expect(answerRise(2.75, 0)).toBe(1);
    expect(answerRise(2.75, 1)).toBeGreaterThan(0);
    expect(answerRise(2.75, 2)).toBe(0);
  });
});

describe("designatedAt", () => {
  it("designates nothing while the question rises", () => {
    expect(designatedAt(0.25)).toBeUndefined();
  });

  it("designates each plate in turn as it arrives, for as long as the next one takes to come", () => {
    expect(designatedAt(0.3)).toEqual({ index: 0 });
    expect(designatedAt(0.6)).toEqual({ index: 1 });
    expect(designatedAt(0.9)).toEqual({ index: 2 });
    expect(designatedAt(1.2)).toEqual({ index: 3 });
    expect(designatedAt(1.36)).toEqual({ index: 3 });
  });

  it("lets go once the last plate has landed, so the four read as one, and stays away from the answer", () => {
    expect(designatedAt(1.42)).toBeUndefined();
    expect(designatedAt(2)).toBeUndefined();
    expect(designatedAt(2.5)).toBeUndefined();
  });
});

describe("the answer's keyword", () => {
  /* Two answer lines: the last one has risen 2.60 + 0.09 + 0.12 = 2.81 screens into the course. */
  const LINES = 2;

  it("comes into focus as its line lands, then the brackets close on it, all before the stage lets go", () => {
    expect(inkWordFocus(2.71, LINES)).toBe(0);
    expect(inkWordFocus(2.83, LINES)).toBeGreaterThan(0);
    expect(inkWordClose(2.83, LINES)).toBe(0);
    expect(inkWordFocus(2.96, LINES)).toBe(1);
    expect(inkWordClose(2.96, LINES)).toBeGreaterThan(0);
    expect(inkWordClose(courseLength(LINES) - 0.1, LINES)).toBe(1);
  });
});

describe("questionHold", () => {
  it("holds the stage for the night's entrance and the course, and no longer", () => {
    expect(questionHold(3)).toBeCloseTo(0.4 + courseLength(3), 5);
  });

  it("drops the night's entrance when the night arrives full-screen over the hero", () => {
    expect(questionHold(3, 0)).toBeCloseTo(courseLength(3), 5);
  });
});

describe("questionDim", () => {
  it("leaves the question whole while the plates arrive and are read, then dims it with them as the shuriken starts to cut", () => {
    expect(questionDim(2.06)).toBe(0);
    expect(questionDim(2.21)).toBeGreaterThan(0.3);
    expect(questionDim(2.36)).toBeGreaterThan(0.6);
  });
});
