import { type Camera, Object3D, type Vector2, Vector3 } from "three";

import { framing, poseCamera } from "./origami-camera.ts";
import type { Piece } from "./origami-piece.ts";
import { type OrigamiWorld, setFolds } from "./origami-world.ts";

export interface WorldFrame {
  progress: number;
  time: number;
}

/* 0 before `start`, 1 after `end`, linear between: a phase of the scroll. */
export function phase(progress: number, start: number, end: number): number {
  return Math.min(Math.max((progress - start) / (end - start), 0), 1);
}

/* When each piece folds, as a share of the whole scroll: the sheet into a plane, then each piece as the
   camera reaches it. */
export const FOLDS = {
  plane: [0.05, 0.28],
  crane: [0.42, 0.54],
  masu: [0.58, 0.7],
  boat: [0.73, 0.85],
} as const;
const FLIGHT = [0.29, 0.47] as const;
const FLOCK_PHASE = [0.84, 1] as const;

/* Paper floats: a slow bob and a slow turn, a phase apart for each piece, around its resting turn. */
function breathe(piece: Piece, time: number, rest: { turn: number; seed: number }): void {
  piece.root.position.setY(0.18 + Math.sin(time * 1.25 + rest.seed) * 0.1);
  piece.root.rotation.set(0, rest.turn + Math.sin(time * 0.7 + rest.seed) * 0.28, 0);
}

/* The plane takes off: it climbs away from the camera, nose lifting, banking a little, then leaves the frame. */
function fly(piece: Piece, flight: number): void {
  Object.assign(piece.root, { visible: flight < 1 });
  if (flight === 0) {
    return;
  }
  const { position, rotation } = piece.root;
  position.set(flight * 0.7, position.y + 1.7 * flight ** 1.5, -7.5 * flight);
  rotation.set(0.32 * flight, rotation.y * (1 - flight), -0.35 * flight);
}

const scratch = new Object3D();

/* The flock flies in from the left, each plane a beat behind the one before, and settles in a loose formation
   in the sky of the wide shot, where it keeps gliding. */
function poseFlock(world: OrigamiWorld, flight: number, time: number): void {
  const count = world.flock.count;
  for (let index = 0; index < count; index += 1) {
    const local = Math.min(Math.max(flight * 1.5 - (index / count) * 0.5, 0), 1);
    const glide = 1 - (1 - local) ** 3;
    const row = index % 4;
    const column = Math.floor(index / 4);
    scratch.position.set(
      -6 + glide * (20 + column * 1.6 + row * 0.7),
      1.8 + row * 0.55 + column * 0.25 + Math.sin(time * 1.6 + index) * 0.18,
      -2.5 - column * 1.1 + row * 0.4,
    );
    scratch.rotation.set(0.14, -Math.PI / 2, -0.1 + Math.sin(time * 1.3 + index) * 0.16);
    scratch.scale.setScalar(local > 0 ? 0.6 : 0);
    scratch.updateMatrix();
    world.flock.setMatrixAt(index, scratch.matrix);
  }
  Object.assign(world.flock.instanceMatrix, { needsUpdate: true });
}

/* Poses the whole studio for a frame of the scroll. The idle life (bob, turn, flutter, a key light that circles)
   starts from zero at the first frame and fades in, so the first frame is the poster's. */
export function poseWorld(world: OrigamiWorld, frame: WorldFrame): void {
  const { progress, time } = frame;
  const life = Math.min(Math.max((time - 0.1) / 1.5, 0), 1);
  const alive = time * life;
  setFolds(
    world,
    {
      plane: 0.1 + phase(progress, ...FOLDS.plane) * 0.9,
      crane: phase(progress, ...FOLDS.crane),
      masu: phase(progress, ...FOLDS.masu),
      boat: phase(progress, ...FOLDS.boat),
    },
    Math.sin(alive * 1.6) * 0.04,
  );
  breathe(world.plane, alive, { turn: 0.5, seed: 0 });
  breathe(world.crane, alive, { turn: -0.45, seed: 1.3 });
  breathe(world.masu, alive, { turn: 0.62, seed: 2.1 });
  breathe(world.boat, alive, { turn: 0.38, seed: 3.4 });
  const flight = phase(progress, ...FLIGHT);
  fly(world.plane, flight);
  world.ground.contacts[0]?.scale.setScalar(Math.max(1 - flight * 1.6, 0.001));
  poseFlock(world, phase(progress, ...FLOCK_PHASE), alive);
}

export interface StudioFrame {
  delta: number;
  progress: number;
  pointer: Vector2;
  aspect: number;
}

/* One frame of the studio: its clock advances by the frame's delta (a paused stage holds it), then the world and
   the camera take their pose. */
export function poseStudio(world: OrigamiWorld, camera: Camera, frame: StudioFrame): void {
  Object.assign(world.clock, { time: world.clock.time + frame.delta });
  const time = world.clock.time;
  poseWorld(world, { progress: frame.progress, time });
  poseCamera(camera, {
    progress: frame.progress,
    pointer: frame.pointer,
    aspect: frame.aspect,
    time,
  });
}

const towardRim = new Vector3();

/* The lights follow the piece in focus: the key grazes it from the front left and drifts slowly around it, the
   rim cuts it from behind, the shadow catcher lies under it. The rim's direction, seen from the camera, tells
   the papers where light shines through them. */
export function placeLights(world: OrigamiWorld, camera: Camera, time: number): void {
  const focus = framing.target;
  const life = Math.min(Math.max((time - 0.1) / 1.5, 0), 1);
  const drift = time * life * 0.5;
  world.key.position.set(
    focus.x - 3.4 + Math.cos(drift) * 0.9,
    focus.y + 1.5,
    focus.z + 2.6 + Math.sin(drift) * 0.9,
  );
  world.key.target.position.copy(focus);
  world.rim.position.set(focus.x + 2.6, focus.y + 2.4, focus.z - 4.6);
  world.rim.target.position.copy(focus);
  world.ground.catcher?.position.set(focus.x, -0.005, focus.z);
  camera.updateMatrixWorld();
  world.backlight.value.copy(
    towardRim.subVectors(world.rim.position, focus).transformDirection(camera.matrixWorldInverse),
  );
}
