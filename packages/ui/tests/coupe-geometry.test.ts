import { describe, expect, it } from "vitest";

import {
  BUTTON_REVEAL,
  coupeHold,
  GHOST_COUNT,
  ghostRaw,
  ghostVisible,
  partAt,
  shake,
  slideAt,
  slitOpacity,
  throwPosition,
  throwRaw,
  throwVisible,
  TITLE_REVEAL,
} from "../src/motion/coupe-geometry.ts";

describe("coupeHold", () => {
  it("holds the stage between two and three screens, long enough for the gesture, the beat and the reveal", () => {
    expect(coupeHold()).toBeGreaterThanOrEqual(2);
    expect(coupeHold()).toBeLessThanOrEqual(3);
  });
});

describe("the throw", () => {
  it("crosses from off one edge to off the other at a constant speed", () => {
    expect(throwRaw(0.2)).toBeCloseTo(0);
    expect(throwRaw(0.31)).toBeCloseTo(1);
    /* Linear: the middle of the window is the middle of the crossing. */
    expect(throwRaw(0.255)).toBeCloseTo(0.5);
  });

  it("is in flight only while it is on the page, not before and not after it has left", () => {
    expect(throwVisible(0.1)).toBe(false);
    expect(throwVisible(0.25)).toBe(true);
    expect(throwVisible(0.4)).toBe(false);
  });

  it("stays within the path once visible", () => {
    expect(throwPosition(0.1)).toBe(0);
    expect(throwPosition(0.255)).toBeCloseTo(0.5);
    expect(throwPosition(0.5)).toBe(1);
  });
});

describe("the ghosts", () => {
  it("trails three ghosts behind the star, each a step further back", () => {
    expect(GHOST_COUNT).toBe(3);
    const star = throwRaw(0.3);
    expect(ghostRaw(0.3, 0)).toBeLessThan(star);
    expect(ghostRaw(0.3, 1)).toBeLessThan(ghostRaw(0.3, 0));
    expect(ghostRaw(0.3, 2)).toBeLessThan(ghostRaw(0.3, 1));
  });

  it("shows a ghost only while the star is in flight and the ghost itself has entered", () => {
    /* Just after entry the furthest ghost has not entered yet. */
    expect(ghostVisible(0.205, 2)).toBe(false);
    expect(ghostVisible(0.28, 0)).toBe(true);
    /* Once the star has left, its ghosts go with it. */
    expect(ghostVisible(0.4, 0)).toBe(false);
  });
});

describe("the hairline left behind", () => {
  it("is absent before the throw, full during the beat, then fades", () => {
    expect(slitOpacity(0.1)).toBe(0);
    expect(slitOpacity(0.34)).toBeCloseTo(1);
    expect(slitOpacity(0.4)).toBeGreaterThan(0);
    expect(slitOpacity(0.4)).toBeLessThan(1);
    expect(slitOpacity(0.42)).toBeCloseTo(0);
    expect(slitOpacity(0.6)).toBe(0);
  });
});

describe("the page giving way", () => {
  it("slides the upper half down the cut first, then settles", () => {
    expect(slideAt(0.37)).toBeCloseTo(0);
    expect(slideAt(0.46)).toBeCloseTo(1);
    expect(slideAt(0.5)).toBe(1);
  });

  it("parts the two halves only after the beat, all the way open by the end of the hold", () => {
    expect(partAt(0.4)).toBe(0);
    expect(partAt(0.44)).toBeCloseTo(0);
    expect(partAt(0.78)).toBeCloseTo(1);
    expect(partAt(0.61)).toBeGreaterThan(0);
    expect(partAt(0.61)).toBeLessThan(0.5);
    expect(partAt(1)).toBe(1);
  });
});

describe("the impact tremble", () => {
  it("is still before the page gives, shakes right after, and has settled by the end", () => {
    expect(shake(0.37)).toBe(0);
    expect(Math.abs(shake(0.39))).toBeGreaterThan(0);
    expect(Math.abs(shake(0.9))).toBeLessThan(0.01);
  });
});

describe("the copy reveal windows", () => {
  it("raises the title as the halves part, and the button last of all", () => {
    expect(TITLE_REVEAL.start).toBeLessThan(BUTTON_REVEAL.start);
    expect(BUTTON_REVEAL.end).toBeLessThanOrEqual(1);
    expect(TITLE_REVEAL.start).toBeGreaterThan(partAt(0.44));
  });
});
