import { OrthographicCamera, PerspectiveCamera, Vector2, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import { type Framing, poseCamera, SHOTS, shotAt } from "../src/scene/origami-camera.ts";

function shot(progress: number): Framing {
  return shotAt(progress, { position: new Vector3(), target: new Vector3(), fov: 0, roll: 0 });
}

function shotNumbers(index: number, part: "position" | "target"): number[] {
  return [...(SHOTS.at(index)?.[part] ?? [])];
}

function middleOfFirstTwo(): { at: number; x: number } {
  const [first, second] = SHOTS;
  return {
    at: ((first?.at ?? 0) + (second?.at ?? 0)) / 2,
    x: ((first?.position[0] ?? 0) + (second?.position[0] ?? 0)) / 2,
  };
}

function viewOf(camera: PerspectiveCamera): { enabled: boolean; offsetY: number } {
  return { enabled: camera.view?.enabled ?? false, offsetY: camera.view?.offsetY ?? 0 };
}

describe("shot list", () => {
  it("opens on the overhead shot of the sheet and ends on the wide shot", () => {
    expect(shot(0).position.toArray()).toEqual(shotNumbers(0, "position"));
    expect(shot(1).position.toArray()).toEqual(shotNumbers(-1, "position"));
    expect(shot(1.2).target.toArray()).toEqual(shotNumbers(-1, "target"));
  });

  it("lengthens the lens on the pieces and banks with the plane", () => {
    expect(shot(0.52).fov).toBeLessThan(shot(0).fov);
    expect(shot(0.4).roll).toBeGreaterThan(0);
  });

  it("eases between two shots", () => {
    const middle = middleOfFirstTwo();
    expect(shot(middle.at).position.x).toBeCloseTo(middle.x, 5);
  });
});

describe("camera pose", () => {
  const frame = { progress: 0, pointer: new Vector2(), time: 0.1 };

  it("frames the paper beside the copy on a wide screen", () => {
    const camera = new PerspectiveCamera();
    poseCamera(camera, { ...frame, aspect: 1.6 });
    expect(camera.fov).toBe(SHOTS[0]?.fov);
    expect(camera.filmOffset).toBeLessThan(0);
    expect(viewOf(camera).enabled).toBe(false);
  });

  it("opens the lens and lifts the paper on a portrait screen", () => {
    const camera = new PerspectiveCamera();
    poseCamera(camera, { ...frame, aspect: 0.46 });
    expect(camera.fov).toBeGreaterThan(34);
    expect(viewOf(camera).offsetY).toBeGreaterThan(0);
  });

  it("leaves a camera that is not a perspective camera alone", () => {
    const camera = new OrthographicCamera();
    poseCamera(camera, { ...frame, aspect: 1 });
    expect(camera.position.toArray()).toEqual([0, 0, 0]);
  });
});
