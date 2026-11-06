import type { Camera, Vector2 } from "three";
import { PerspectiveCamera, Vector3 } from "three";

type Triple = readonly [number, number, number];

interface Shot {
  at: number;
  position: Triple;
  target: Triple;
  /* The lens: long on a piece (a studio object shot), wider for the sheet and the sky. */
  fov: number;
  /* A bank of the horizon, in radians: the camera leans with the plane. */
  roll: number;
}

/* Where the pieces stand in the studio: the sheet and its plane at the origin, then a line of three pieces. */
export const STATIONS = {
  sheet: [0, 0, 0],
  crane: [6.5, 0, -1],
  masu: [13, 0, 0],
  boat: [19.5, 0, -0.6],
} as const satisfies Record<string, Triple>;

/* The camera's shot list along the scroll: a close three-quarter overhead on the sheet, partly out of frame;
   a long lens as it folds; the plane followed into the air with a bank; a lateral travel to the crane; an
   overhead on the box; a true low angle on the boat; then a wide shot for the flock. Each piece is held while
   it folds. */
export const SHOTS: readonly Shot[] = [
  { at: 0, position: [1.55, 2.8, 2.55], target: [-0.95, 0, 0.15], fov: 34, roll: 0 },
  { at: 0.1, position: [2.2, 3.3, 3.3], target: [-0.75, 0, 0], fov: 30, roll: 0 },
  { at: 0.27, position: [5.5, 2.2, 5.8], target: [0, 0.25, -0.2], fov: 22, roll: 0 },
  { at: 0.4, position: [1.6, 1.5, 4.2], target: [0.6, 1.4, -4.6], fov: 30, roll: 0.14 },
  { at: 0.48, position: [11.8, 1.95, 6.3], target: [6.5, 0.45, -1], fov: 21, roll: 0 },
  { at: 0.56, position: [11.05, 2.3, 6.8], target: [6.5, 0.5, -1], fov: 21, roll: 0 },
  { at: 0.63, position: [13.8, 7.5, 3.4], target: [13, 0.1, 0], fov: 22, roll: 0 },
  { at: 0.72, position: [14.3, 6.7, 4.15], target: [13, 0.1, 0], fov: 22, roll: 0 },
  { at: 0.79, position: [15.95, -1.55, 6.15], target: [19.6, 0.8, -0.6], fov: 23, roll: -0.05 },
  { at: 0.87, position: [16.5, -1.35, 6.7], target: [19.6, 0.8, -0.6], fov: 23, roll: -0.05 },
  { at: 1, position: [15.5, 4.2, 9], target: [16.5, 1.6, -3], fov: 34, roll: 0 },
];

function ease(amount: number): number {
  return amount * amount * (3 - 2 * amount);
}

const from = new Vector3();
const to = new Vector3();

export interface Framing {
  position: Vector3;
  target: Vector3;
  fov: number;
  roll: number;
}

/* The shot at a progress: the two shots around it, eased into each other; before the first or after the last,
   that shot alone. */
export function shotAt(progress: number, framing: Framing): Framing {
  const nextIndex = SHOTS.findIndex((shot) => shot.at > progress);
  const next = nextIndex === -1 ? SHOTS.at(-1) : SHOTS.at(nextIndex);
  const previous = nextIndex > 0 ? SHOTS.at(nextIndex - 1) : next;
  if (next === undefined || previous === undefined) {
    return framing;
  }
  const span = Math.max(next.at - previous.at, 1e-6);
  const amount = ease(Math.min(Math.max((progress - previous.at) / span, 0), 1));
  framing.position.lerpVectors(from.set(...previous.position), to.set(...next.position), amount);
  framing.target.lerpVectors(from.set(...previous.target), to.set(...next.target), amount);
  return Object.assign(framing, {
    fov: previous.fov + (next.fov - previous.fov) * amount,
    roll: previous.roll + (next.roll - previous.roll) * amount,
  });
}

export interface CameraFrame {
  progress: number;
  pointer: Vector2;
  aspect: number;
  time: number;
}

/* The framing of the current frame: the lights read its target, so the key light follows the piece in focus. */
export const framing: Framing = {
  position: new Vector3(),
  target: new Vector3(),
  fov: 34,
  roll: 0,
};

/* Poses the camera for a frame: the shot, a drift that breathes, the pointer's parallax, the lens and the bank.
   On a wide screen the subject sits right of centre, beside the copy; on a portrait screen the lens opens and
   the paper rises into the top half, above the copy. */
export function poseCamera(camera: Camera, frame: CameraFrame): void {
  if (!(camera instanceof PerspectiveCamera)) {
    return;
  }
  shotAt(frame.progress, framing);
  const { position, target } = framing;
  camera.position.set(
    position.x + frame.pointer.x * 0.35 + Math.sin(frame.time * 0.31) * 0.08,
    position.y + frame.pointer.y * 0.22 + Math.cos(frame.time * 0.27) * 0.06,
    position.z,
  );
  camera.lookAt(target);
  camera.rotateZ(framing.roll);
  const portrait = frame.aspect < 1;
  Object.assign(camera, {
    fov: portrait ? framing.fov * 1.6 : framing.fov,
    filmOffset: frame.aspect > 1.15 ? -5 : 0,
  });
  if (portrait) {
    camera.setViewOffset(frame.aspect, 1, 0, 0.24, frame.aspect, 1);
  } else {
    camera.clearViewOffset();
  }
  camera.updateProjectionMatrix();
}
