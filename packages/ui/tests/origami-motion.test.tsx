import { Matrix4, PerspectiveCamera, Vector2, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { phase, placeLights, poseStudio, poseWorld, STEPS } from "../src/scene/origami-motion.ts";
import { createWorld, disposeWorld, FLOCK } from "../src/scene/origami-world.ts";

const palette = {
  paper: [255, 255, 255],
  ivory: [236, 230, 218],
  signal: [255, 79, 26],
  cobalt: [47, 59, 255],
  ink: [14, 14, 12],
} as const;

function world() {
  return createWorld(
    "light",
    {
      paper: [...palette.paper],
      ivory: [...palette.ivory],
      signal: [...palette.signal],
      cobalt: [...palette.cobalt],
      ink: [...palette.ink],
    },
    "sans-serif",
  );
}

function flockScale(studio: ReturnType<typeof world>, index: number): number {
  const matrix = new Matrix4();
  studio.flock.getMatrixAt(index, matrix);
  return new Vector3().setFromMatrixScale(matrix).x;
}

describe("studio phases", () => {
  it("reads a phase of the scroll", () => {
    expect(phase(0.1, 0.2, 0.4)).toBe(0);
    expect(phase(0.3, 0.2, 0.4)).toBeCloseTo(0.5, 5);
    expect(phase(0.5, 0.2, 0.4)).toBe(1);
  });

  it("tells the steps in the order software is built", () => {
    expect(STEPS.pattern[1]).toBeLessThan(STEPS.base[0]);
    expect(STEPS.base[1]).toBeLessThan(STEPS.modules[0]);
    expect(STEPS.modules[1]).toBeLessThan(STEPS.crane[0]);
    expect(STEPS.crane[1]).toBeLessThan(STEPS.plane[0]);
    expect(STEPS.plane[1]).toBeLessThanOrEqual(STEPS.flight[0]);
  });
});

describe("posing the studio", () => {
  it("brings the plane in for its step, then lets it fly out of the frame", () => {
    const studio = world();
    poseWorld(studio, { progress: 0, time: 0.1 });
    expect(studio.plane.root.visible).toBe(false);
    poseWorld(studio, { progress: 0.76, time: 0.1 });
    expect(studio.plane.root.visible).toBe(true);
    poseWorld(studio, { progress: 1, time: 0.1 });
    expect(studio.plane.root.visible).toBe(false);
    expect(studio.ground.contacts[3]?.scale.x).toBeLessThan(0.01);
    poseWorld(studio, { progress: 0.76, time: 0.1 });
    expect(studio.plane.root.visible).toBe(true);
    disposeWorld(studio);
  });

  it("brings the flock in only for the wide shot", () => {
    const studio = world();
    poseWorld(studio, { progress: 0.7, time: 1 });
    expect(flockScale(studio, 0)).toBe(0);
    poseWorld(studio, { progress: 1, time: 1 });
    expect(flockScale(studio, FLOCK.light - 1)).toBeGreaterThan(0);
    disposeWorld(studio);
  });

  it("holds its idle life at the first frame, so the poster stays true", () => {
    const first = world();
    const later = world();
    const camera = new PerspectiveCamera();
    placeLights(first, camera, 0.1);
    placeLights(later, camera, 0.1);
    expect(first.key.position.toArray()).toEqual(later.key.position.toArray());
    placeLights(later, camera, 3);
    expect(later.key.position.toArray()).not.toEqual(first.key.position.toArray());
    disposeWorld(first);
    disposeWorld(later);
  });

  it("advances its own clock by each frame's delta", () => {
    const studio = world();
    const camera = new PerspectiveCamera();
    const frame = { delta: 0.1, progress: 0, pointer: new Vector2(), aspect: 1.6 };
    poseStudio(studio, camera, frame);
    poseStudio(studio, camera, frame);
    expect(studio.clock.time).toBeCloseTo(0.2, 5);
    expect(camera.position.y).toBeGreaterThan(2);
    expect(studio.backlight.value.length()).toBeCloseTo(1, 5);
    disposeWorld(studio);
  });
});

describe("the story in paper", () => {
  it("traces the pattern before the base gathers, then lets it fade", () => {
    const studio = world();
    const [valley] = studio.sheet.pattern.lines;
    poseWorld(studio, { progress: 0.15, time: 0.1 });
    expect(valley?.geometry.drawRange.count).toBeGreaterThan(0);
    expect(studio.sheet.pattern.materials[0]?.opacity).toBe(1);
    poseWorld(studio, { progress: 0.32, time: 0.1 });
    expect(studio.sheet.pattern.materials[0]?.opacity).toBe(0);
    disposeWorld(studio);
  });

  it("brings the modules in one by one until the cube is closed", () => {
    const studio = world();
    poseWorld(studio, { progress: 0.3, time: 0.1 });
    expect(studio.cube.units.every((unit) => !unit.root.visible)).toBe(true);
    poseWorld(studio, { progress: 0.62, time: 0.1 });
    expect(studio.cube.units.every((unit) => unit.root.visible)).toBe(true);
    expect(studio.cube.units[0]?.root.position.z).toBeCloseTo(0.5, 5);
    disposeWorld(studio);
  });

  it("lifts the base off the floor as it gathers", () => {
    const studio = world();
    poseWorld(studio, { progress: 0, time: 0.1 });
    const flat = studio.sheet.piece.root.position.y;
    poseWorld(studio, { progress: 0.4, time: 0.1 });
    expect(studio.sheet.piece.root.position.y).toBeGreaterThan(flat + 0.5);
    disposeWorld(studio);
  });
});
