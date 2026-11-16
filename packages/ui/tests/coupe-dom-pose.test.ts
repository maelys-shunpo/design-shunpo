import { describe, expect, it } from "vitest";

import { coupeHold, GHOST_COUNT, readingFraction } from "../src/motion/coupe-geometry.ts";
import { poseCoupeDom } from "../src/scene/coupe-dom-pose.ts";

/* The scene progress that drives the gesture to `count` screens of its hold. It mirrors `screens()` in
   coupe-geometry.test.ts, lifted through the reading remap so `gestureProgress(scene(count)) === count / coupeHold()`:
   past the reading dwell first, then `count` screens into the gesture. The pose is read through this remapped
   sceneProgress, so the assertion points line up with the geometry test's. */
function scene(count: number): number {
  const gesture = count / coupeHold();
  return readingFraction() + gesture * (1 - readingFraction());
}

describe("the thrown star", () => {
  it("is off the page before it enters and after it has left, on the page in between", () => {
    expect(poseCoupeDom(scene(0.03)).star.visible).toBe(false);
    expect(poseCoupeDom(scene(0.2)).star.visible).toBe(true);
    expect(poseCoupeDom(scene(0.45)).star.visible).toBe(false);
  });

  it("travels from one edge of the cut to the other, 0 to 1, over the throw", () => {
    expect(poseCoupeDom(scene(0.06)).star.along).toBeCloseTo(0);
    expect(poseCoupeDom(scene(0.215)).star.along).toBeCloseTo(0.5);
    expect(poseCoupeDom(scene(0.37)).star.along).toBeCloseTo(1);
  });

  it("spins further the further it is along the cut", () => {
    const early = poseCoupeDom(scene(0.1)).star;
    const late = poseCoupeDom(scene(0.3)).star;
    expect(Math.abs(late.spinTurns)).toBeGreaterThan(Math.abs(early.spinTurns));
  });
});

describe("the ghosts", () => {
  it("trails one ghost per Shunpo Shift step, each held a step behind the one before", () => {
    const pose = poseCoupeDom(scene(0.33));
    expect(pose.ghosts).toHaveLength(GHOST_COUNT);
    let previous = pose.star.along;
    for (const ghost of pose.ghosts) {
      expect(ghost.along).toBeLessThan(previous);
      previous = ghost.along;
    }
  });

  it("keeps a ghost off the page until it too has entered", () => {
    const pose = poseCoupeDom(scene(0.075));
    const furthest = pose.ghosts.at(GHOST_COUNT - 1);
    expect(furthest?.visible).toBe(false);
  });
});

describe("the hairline left behind", () => {
  it("follows the geometry: absent before the throw, full through the beat, then gone", () => {
    expect(poseCoupeDom(scene(0.03)).slit.opacity).toBe(0);
    expect(poseCoupeDom(scene(0.45)).slit.opacity).toBeCloseTo(1);
    expect(poseCoupeDom(scene(0.676)).slit.opacity).toBeCloseTo(0);
  });

  it("runs from the entry edge to the star's head", () => {
    expect(poseCoupeDom(scene(0.215)).slit.along).toBeCloseTo(0.5);
    /* Once the star has left, the hairline reaches the far edge. */
    expect(poseCoupeDom(scene(0.45)).slit.along).toBeCloseTo(1);
  });
});

describe("the two halves", () => {
  it("names the upper half first and the lower half second", () => {
    expect(poseCoupeDom(scene(1)).halves.map((half) => half.side)).toStrictEqual([1, -1]);
  });

  it("parts the halves only late, open all the way by the end of the hold", () => {
    const [upperClosed] = poseCoupeDom(scene(0.7)).halves;
    expect(upperClosed?.part).toBe(0);
    const [upperMid] = poseCoupeDom(scene(1.2)).halves;
    expect(upperMid?.part).toBeGreaterThan(0);
    expect(upperMid?.part).toBeLessThan(0.5);
    const [upperOpen] = poseCoupeDom(scene(1.684)).halves;
    expect(upperOpen?.part).toBeCloseTo(1);
  });
});

describe("the impact tremble", () => {
  it("is still until the page gives, then trembles with y a fraction of x", () => {
    const before = poseCoupeDom(scene(0.5)).shake;
    expect(before.x).toBe(0);
    expect(before.y).toBe(0);
    const after = poseCoupeDom(scene(0.59)).shake;
    expect(Math.abs(after.x)).toBeGreaterThan(0);
    expect(after.y).toBeCloseTo(after.x * 0.6);
  });
});

describe("the reveal", () => {
  it("stays covered until the halves are parted, then uncovers the closing", () => {
    expect(poseCoupeDom(scene(0.7)).revealed).toBe(false);
    expect(poseCoupeDom(scene(1.684)).revealed).toBe(true);
  });
});

describe("the cut line", () => {
  it("carries the WebGL world's cut as resolution-independent values", () => {
    const { cut } = poseCoupeDom(scene(0));
    expect(cut.center.x).toBe(0);
    expect(cut.center.y).toBeCloseTo(-0.35 / 8);
    expect(cut.angle).toBeCloseTo(Math.atan2(-0.3, 1));
  });
});
