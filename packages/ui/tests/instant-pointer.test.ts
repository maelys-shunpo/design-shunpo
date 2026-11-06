import { describe, expect, it } from "vitest";

import { pointerTarget } from "../src/scene/instant-pointer.ts";

const BOX = { left: 100, top: 50, width: 200, height: 100 };

describe("Instant pointer", () => {
  it("parts the ink at full strength over the canvas, in clip space", () => {
    expect(pointerTarget({ clientX: 200, clientY: 100 }, BOX)).toEqual([0, 0, 1]);
    expect(pointerTarget({ clientX: 300, clientY: 50 }, BOX)).toEqual([1, 1, 1]);
  });

  it("lets the ink close once the pointer leaves the canvas", () => {
    expect(pointerTarget({ clientX: 20, clientY: 100 }, BOX)[2]).toBe(0);
  });
});
