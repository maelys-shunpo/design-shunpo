import { Matrix4, PerspectiveCamera, Vector2, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { FOLDS, phase, placeLights, poseStudio, poseWorld } from "../src/scene/origami-motion.ts";
import { createWorld, disposeWorld, FLOCK } from "../src/scene/origami-world.ts";

const palette = {
  ivory: [239, 233, 221],
  citron: [228, 240, 90],
  cobalt: [43, 68, 255],
  white: [251, 250, 247],
} as const;

function world() {
  return createWorld("light", {
    ivory: [...palette.ivory],
    citron: [...palette.citron],
    cobalt: [...palette.cobalt],
    white: [...palette.white],
  });
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

  it("folds each piece in turn, in the order the camera meets them", () => {
    expect(FOLDS.plane[1]).toBeLessThan(FOLDS.crane[0]);
    expect(FOLDS.crane[1]).toBeLessThan(FOLDS.masu[0]);
    expect(FOLDS.masu[1]).toBeLessThan(FOLDS.boat[0]);
  });
});

describe("posing the studio", () => {
  it("keeps the plane on the sheet at first, then lets it fly out of the frame", () => {
    const studio = world();
    poseWorld(studio, { progress: 0, time: 0.1 });
    expect(studio.plane.root.visible).toBe(true);
    poseWorld(studio, { progress: 0.6, time: 0.1 });
    expect(studio.plane.root.visible).toBe(false);
    expect(studio.ground.contacts[0]?.scale.x).toBeLessThan(0.01);
    poseWorld(studio, { progress: 0, time: 0.1 });
    expect(studio.plane.root.visible).toBe(true);
    disposeWorld(studio);
  });

  it("brings the flock in only for the wide shot", () => {
    const studio = world();
    poseWorld(studio, { progress: 0.5, time: 1 });
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
