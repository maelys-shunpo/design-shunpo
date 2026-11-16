import { describe, expect, it } from "vitest";

import { frameAround, ghostTrail } from "../src/lib/frame-jump.ts";

describe("frameAround", () => {
  it("frames a box in its stage's coordinates, a step outside it", () => {
    const box = frameAround(
      { left: 140, top: 260, width: 200, height: 40 },
      { left: 100, top: 200 },
      12,
    );

    expect(box).toEqual({ x: 28, y: 48, width: 224, height: 64 });
  });

  it("can stand off a line of text more on its sides than above and below it", () => {
    const box = frameAround(
      { left: 140, top: 260, width: 200, height: 40 },
      { left: 100, top: 200 },
      { inline: 12, block: 0 },
    );

    expect(box).toEqual({ x: 28, y: 60, width: 224, height: 40 });
  });
});

describe("ghostTrail", () => {
  const from = { x: 0, y: 0, width: 60, height: 60 };
  const to = { x: 300, y: -90, width: 240, height: 90 };

  it("leaves three ghosts along the way, from where the frame was", () => {
    const trail = ghostTrail(from, to);

    expect(trail).toHaveLength(3);
    expect(trail[0]).toMatchObject(from);
    expect(trail[1]).toMatchObject({ x: 100, y: -30, width: 120, height: 70 });
    expect(trail[2]).toMatchObject({ x: 200, y: -60, width: 180, height: 80 });
  });

  it("fades the oldest ghost the most", () => {
    const opacities = ghostTrail(from, to).map((ghost) => ghost.opacity);

    expect(opacities).toEqual([0.15, 0.3, 0.45]);
  });

  it("leaves no ghost when the frame does not move", () => {
    expect(ghostTrail(from, from)).toEqual([]);
  });
});
