import { describe, expect, it } from "vitest";

import {
  BUTTON_REVEAL,
  coupeHold,
  gestureProgress,
  GHOST_COUNT,
  ghostRaw,
  ghostVisible,
  partAt,
  READING_SCREENS,
  readingFraction,
  sceneHold,
  shake,
  slideAt,
  slitOpacity,
  throwPosition,
  throwRaw,
  throwVisible,
  TITLE_REVEAL,
} from "../src/motion/coupe-geometry.ts";

/* A point of the held stage, in screens of scroll since it was held, as the scene's progress. */
function screens(count: number): number {
  return count / coupeHold();
}

describe("coupeHold", () => {
  it("holds the stage between two and two and a half screens, long enough for the gesture, the beat and the reveal", () => {
    expect(coupeHold()).toBeGreaterThanOrEqual(2);
    expect(coupeHold()).toBeLessThanOrEqual(2.5);
  });
});

describe("the throw", () => {
  it("throws the star as soon as the stage is held, with no empty paper first", () => {
    expect(throwRaw(0)).toBeLessThan(0);
    expect(throwVisible(screens(0.1))).toBe(true);
  });

  it("crosses from off one edge to off the other at a constant speed, in about a third of a screen", () => {
    expect(throwRaw(screens(0.06))).toBeCloseTo(0);
    expect(throwRaw(screens(0.37))).toBeCloseTo(1);
    /* Linear: the middle of the window is the middle of the crossing. */
    expect(throwRaw(screens(0.215))).toBeCloseTo(0.5);
  });

  it("is in flight only while it is on the page, not before and not after it has left", () => {
    expect(throwVisible(screens(0.03))).toBe(false);
    expect(throwVisible(screens(0.2))).toBe(true);
    expect(throwVisible(screens(0.45))).toBe(false);
  });

  it("stays within the path once visible", () => {
    expect(throwPosition(screens(0.03))).toBe(0);
    expect(throwPosition(screens(0.215))).toBeCloseTo(0.5);
    expect(throwPosition(screens(1))).toBe(1);
  });
});

describe("the ghosts", () => {
  it("trails three ghosts behind the star, each a step further back", () => {
    expect(GHOST_COUNT).toBe(3);
    const at = screens(0.33);
    const star = throwRaw(at);
    expect(ghostRaw(at, 0)).toBeLessThan(star);
    expect(ghostRaw(at, 1)).toBeLessThan(ghostRaw(at, 0));
    expect(ghostRaw(at, 2)).toBeLessThan(ghostRaw(at, 1));
  });

  it("shows a ghost only while the star is in flight and the ghost itself has entered", () => {
    /* Just after entry the furthest ghost has not entered yet. */
    expect(ghostVisible(screens(0.075), 2)).toBe(false);
    expect(ghostVisible(screens(0.3), 0)).toBe(true);
    /* Once the star has left, its ghosts go with it. */
    expect(ghostVisible(screens(0.45), 0)).toBe(false);
  });
});

describe("the hairline left behind", () => {
  it("is absent before the throw, full during the beat, then fades", () => {
    expect(slitOpacity(screens(0.03))).toBe(0);
    expect(slitOpacity(screens(0.45))).toBeCloseTo(1);
    expect(slitOpacity(screens(0.62))).toBeGreaterThan(0);
    expect(slitOpacity(screens(0.62))).toBeLessThan(1);
    expect(slitOpacity(screens(0.676))).toBeCloseTo(0);
    expect(slitOpacity(screens(1))).toBe(0);
  });
});

describe("the page giving way", () => {
  it("slides the upper half down the cut first, then settles", () => {
    expect(slideAt(screens(0.536))).toBeCloseTo(0);
    expect(slideAt(screens(0.788))).toBeCloseTo(1);
    expect(slideAt(screens(0.9))).toBe(1);
  });

  it("parts the two halves only after the beat, all the way open before the end of the hold", () => {
    expect(partAt(screens(0.7))).toBe(0);
    expect(partAt(screens(0.732))).toBeCloseTo(0);
    expect(partAt(screens(1.684))).toBeCloseTo(1);
    expect(partAt(screens(1.2))).toBeGreaterThan(0);
    expect(partAt(screens(1.2))).toBeLessThan(0.5);
    expect(partAt(1)).toBe(1);
  });
});

describe("the impact tremble", () => {
  it("is still before the page gives, shakes right after, and has settled by the end", () => {
    expect(shake(screens(0.536))).toBe(0);
    expect(Math.abs(shake(screens(0.59)))).toBeGreaterThan(0);
    expect(Math.abs(shake(screens(1.4)))).toBeLessThan(0.01);
  });
});

describe("the copy reveal windows", () => {
  it("raises the title as the halves part, and the button last of all, before the hold lets go", () => {
    expect(TITLE_REVEAL.start).toBeLessThan(BUTTON_REVEAL.start);
    expect(BUTTON_REVEAL.end).toBeLessThan(1);
    expect(TITLE_REVEAL.start).toBeGreaterThan(partAt(screens(0.732)));
  });
});

describe("the reading dwell before the gesture", () => {
  it("holds the gesture at zero through the whole reading dwell", () => {
    expect(gestureProgress(0)).toBe(0);
    expect(gestureProgress(readingFraction() * 0.5)).toBe(0);
    expect(gestureProgress(readingFraction())).toBeCloseTo(0);
  });
  it("maps the rest of the scroll linearly onto the full gesture", () => {
    expect(gestureProgress(1)).toBeCloseTo(1);
    const mid = readingFraction() + (1 - readingFraction()) * 0.5;
    expect(gestureProgress(mid)).toBeCloseTo(0.5);
  });
  it("extends the held scene by the reading dwell without touching the gesture hold", () => {
    expect(sceneHold()).toBeCloseTo(READING_SCREENS + coupeHold());
    /* inchangé */
    expect(coupeHold()).toBeGreaterThanOrEqual(2);
  });
});
