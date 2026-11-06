import { PerspectiveCamera, Vector2 } from "three";
import { describe, expect, it } from "vitest";

import { createCalibre, disposeCalibre } from "../src/scene/mecanique-calibre.ts";
import {
  assemblyOf,
  dialOf,
  poseCalibre,
  poseCamera,
  runOf,
} from "../src/scene/mecanique-motion.ts";
import type { CalibrePalette } from "../src/scene/mecanique-parts.ts";

const palette: CalibrePalette = {
  steel: [189, 200, 204],
  brass: [229, 196, 140],
  plate: [39, 50, 54],
  ruby: [185, 69, 50],
  dial: [243, 240, 233],
  ink: [30, 38, 41],
  blued: [122, 182, 204],
};

function settled(progress: number) {
  const calibre = createCalibre("light", palette);
  poseCalibre(calibre, { progress, time: 0, delta: 0.1 });
  return calibre;
}

describe("calibre phases", () => {
  it("holds the exploded view through the dead zone, then lands every part in order", () => {
    expect(assemblyOf(0, 0.05)).toBe(0);
    expect(assemblyOf(0, 0.3)).toBe(1);
    expect(assemblyOf(5, 0.2)).toBeLessThan(assemblyOf(0, 0.2));
    expect(assemblyOf(15, 0.7)).toBe(1);
  });

  it("starts the movement after the assembly and brings the dial last", () => {
    expect(runOf(0.3)).toBe(0);
    expect(runOf(0.7)).toBe(1);
    expect(dialOf(0.7)).toBe(0);
    expect(dialOf(1)).toBe(1);
  });
});

describe("calibre pose", () => {
  it("shows every part at its exploded place on the first frame, the poster's", () => {
    const calibre = settled(0);

    for (const part of calibre.parts) {
      expect(part.object.position.distanceTo(part.exploded)).toBeLessThan(0.05);
    }
    expect(calibre.dial.visible).toBe(false);
    expect(calibre.running).toBe(0);
    disposeCalibre(calibre);
  });

  it("seats every part, runs the train and shows the dial at the end of the scroll", () => {
    const calibre = settled(1);
    poseCalibre(calibre, { progress: 1, time: 1, delta: 0.1 });

    for (const part of calibre.parts) {
      expect(part.object.position.distanceTo(part.home)).toBeLessThan(1e-6);
    }
    expect(calibre.running).toBeCloseTo(0.2);
    expect(calibre.dial.visible).toBe(true);
    expect(calibre.train[0]?.object.rotation.z).not.toBe(0);
    disposeCalibre(calibre);
  });

  it("frames the exploded stack from afar and faces the dial up close", () => {
    const camera = new PerspectiveCamera();
    poseCamera(camera, { progress: 0, pointer: new Vector2(), aspect: 1 });
    const far = camera.position.length();
    poseCamera(camera, { progress: 1, pointer: new Vector2(), aspect: 1 });

    expect(camera.position.length()).toBeLessThan(far);
    expect(Math.abs(camera.position.y)).toBeLessThan(0.2);
    poseCamera(camera, { progress: 1, pointer: new Vector2(), aspect: 0.5 });
    expect(camera.position.length()).toBeGreaterThan(far);
  });
});
