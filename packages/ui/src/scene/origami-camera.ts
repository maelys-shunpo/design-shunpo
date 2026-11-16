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

/* Where the pieces stand in the studio: the atelier where the sheet is drawn and folded, the cube of
   modules, the crane, and the launch pad of the plane. */
export const STATIONS = {
  atelier: [0, 0, 0],
  modules: [9, 0, -0.5],
  crane: [16, 0, -1],
  launch: [23, 0, 0],
} as const satisfies Record<string, Triple>;

/* An orbit around the cube while its units arrive: a quarter turn and more, at one height and distance. */
function orbit(at: number, angle: number): Shot {
  const [x, , z] = STATIONS.modules;
  return {
    at,
    position: [x + Math.sin(angle) * 6.4, 2.6, z + Math.cos(angle) * 6.4],
    target: [x, 0.62, z],
    fov: 26,
    roll: 0,
  };
}

/* The camera's shot list, one move per step of the story: a close three-quarter on the blank sheet; an
   overhead while the crease pattern is traced; a close, low shot on the pleats of the base; an orbit around
   the cube of modules; a low angle on the crane; a travel with the plane as it takes off; a wide shot for the
   flock. Each step is held while its paper folds. */
export const SHOTS: readonly Shot[] = [
  { at: 0, position: [2.5, 4, 3.6], target: [-1.15, 0, 0.15], fov: 34, roll: 0 },
  { at: 0.1, position: [-0.85, 7.4, 0.7], target: [-1.05, 0, 0], fov: 30, roll: 0 },
  { at: 0.2, position: [-0.8, 7.1, 0.9], target: [-1.05, 0, 0], fov: 30, roll: 0 },
  { at: 0.28, position: [3.5, 3, 4.5], target: [-0.95, 0.5, 0], fov: 24, roll: 0 },
  { at: 0.36, position: [3.9, 3.3, 5], target: [-0.95, 0.55, 0], fov: 24, roll: 0 },
  orbit(0.43, -0.45),
  orbit(0.49, 0.25),
  orbit(0.54, 0.95),
  orbit(0.59, 1.6),
  { at: 0.65, position: [13, -1.15, 5.6], target: [16, 1, -1], fov: 23, roll: -0.04 },
  { at: 0.74, position: [13.3, -0.95, 6], target: [16, 1, -1], fov: 23, roll: -0.04 },
  { at: 0.79, position: [25.6, 1.5, 4.6], target: [22.2, 0.35, 0], fov: 25, roll: 0 },
  { at: 0.89, position: [24.4, 1.8, -0.9], target: [22.6, 1.3, -6.4], fov: 30, roll: 0.14 },
  { at: 1, position: [20, 3.4, 6.5], target: [20.7, 2.1, -3.5], fov: 34, roll: 0 },
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
    position.x + frame.pointer.x * 0.35 + Math.sin(frame.time * 0.45) * 0.28,
    position.y + frame.pointer.y * 0.22 + Math.cos(frame.time * 0.38) * 0.16,
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
