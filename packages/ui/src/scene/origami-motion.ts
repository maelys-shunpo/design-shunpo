import { type Camera, Object3D, Quaternion, type Vector2, Vector3 } from "three";

import { framing, poseCamera, STATIONS } from "./origami-camera.ts";
import { tracePattern } from "./origami-creases.ts";
import { poseCube } from "./origami-cube.ts";
import { setFold } from "./origami-folds.ts";
import type { Piece } from "./origami-piece.ts";
import type { OrigamiWorld } from "./origami-world.ts";

export interface WorldFrame {
  progress: number;
  time: number;
}

/* 0 before `start`, 1 after `end`, linear between: a phase of the scroll. */
export function phase(progress: number, start: number, end: number): number {
  return Math.min(Math.max((progress - start) / (end - start), 0), 1);
}

/* The story along the scroll, as shares of it: the pattern is traced, the sheet gathers into its base, the
   modules lock into a cube, the crane takes shape, the plane is folded and launched, the flock follows. */
export const STEPS = {
  pattern: [0.1, 0.21],
  base: [0.23, 0.36],
  modules: [0.41, 0.6],
  crane: [0.62, 0.74],
  plane: [0.75, 0.8],
  flight: [0.8, 0.92],
  flock: [0.88, 1],
} as const;

const corner = new Quaternion();

/* A piece is in the studio only around its own step, so the camera never meets the next one too early, nor
   the last one in the back of a shot. */
const PRESENCE = {
  sheet: [-1, 0.42],
  cube: [0.36, 0.66],
  crane: [0.615, 2],
  plane: [0.745, 2],
} as const;

function present(progress: number, [from, to]: readonly [number, number]): boolean {
  return progress > from && progress < to;
}

function stage(world: OrigamiWorld, progress: number): void {
  const pieces = [world.sheet.piece.root, world.cube.root, world.crane.root, world.plane.root];
  const windows = [PRESENCE.sheet, PRESENCE.cube, PRESENCE.crane, PRESENCE.plane];
  pieces.forEach((piece, index) => {
    const window = windows[index] ?? PRESENCE.sheet;
    const here = present(progress, window);
    Object.assign(piece, { visible: here && (index !== 3 || piece.visible) });
    Object.assign(world.ground.contacts[index] ?? {}, { visible: here });
  });
}

/* The blank sheet already shows its first gesture: one corner lifted toward the light, which it lets go of as
   the base gathers. */
function liftCorner(world: OrigamiWorld, amount: number): void {
  const facet = world.sheet.piece.facets.at(-1);
  if (facet === undefined) {
    return;
  }
  corner.setFromAxisAngle(facet.axis, 0.55 * amount * Math.sign(facet.angle));
  facet.pivot.quaternion.multiply(corner);
}

/* Paper floats: a slow bob and a slow turn, a phase apart for each piece, around its resting turn. */
function breathe(piece: Piece, time: number, rest: { turn: number; seed: number }): void {
  piece.root.position.setY(0.18 + Math.sin(time * 1.25 + rest.seed) * 0.1);
  piece.root.rotation.set(0, rest.turn + Math.sin(time * 0.7 + rest.seed) * 0.28, 0);
}

/* The plane takes off: it climbs away from the camera, nose lifting, banking a little, then leaves the frame. */
interface Pad {
  station: readonly [number, number, number];
  time: number;
}

function fly(piece: Piece, flight: number, { station: [x, , z], time }: Pad): void {
  Object.assign(piece.root, { visible: flight < 1 });
  if (flight === 0) {
    piece.root.position.set(x, piece.root.position.y, z);
    return;
  }
  const { position, rotation } = piece.root;
  position.set(x + flight * 0.7, position.y + 1.7 * flight ** 1.5, z - 7.5 * flight);
  rotation.set(
    0.32 * flight,
    rotation.y * (1 - flight),
    -0.35 * flight + Math.sin(time * 1.3) * 0.16 * flight,
  );
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
      -3 + glide * (20 + column * 1.6 + row * 0.7) + Math.sin(time * 1.1 + index) * 0.6 * glide,
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

/* Poses the whole studio for a frame of the scroll. The idle life (bob, turn, flutter) starts from zero at
   the first frame and fades in, so the first frame is the poster's. */
export function poseWorld(world: OrigamiWorld, frame: WorldFrame): void {
  const { progress, time } = frame;
  const life = Math.min(Math.max((time - 0.1) / 1.5, 0), 1);
  const alive = time * life;
  const breath = { flutter: Math.sin(alive * 1.6) * 0.04, rest: 0.05 };
  const base = phase(progress, ...STEPS.base);
  setFold(world.sheet.piece.facets, base, breath);
  liftCorner(world, 1 - base);
  tracePattern(
    world.sheet.pattern,
    phase(progress, ...STEPS.pattern),
    phase(progress, 0.08, 0.12) * (1 - phase(progress, 0.24, 0.3)),
  );
  poseCube(world.cube, phase(progress, ...STEPS.modules), breath.flutter);
  world.cube.root.rotation.set(0, 0.35 + Math.sin(alive * 0.55) * 0.18, 0);
  setFold(world.crane.facets, phase(progress, ...STEPS.crane), breath);
  setFold(world.plane.facets, phase(progress, ...STEPS.plane), breath);
  breathe(world.sheet.piece, alive, { turn: 0.5, seed: 0 });
  /* The pleats hang below the sheet as the base gathers: the sheet rises so they never touch the floor. */
  world.sheet.piece.root.position.setY(world.sheet.piece.root.position.y + base * 0.6);
  breathe(world.crane, alive, { turn: -0.45, seed: 1.3 });
  breathe(world.plane, alive, { turn: 0.2, seed: 2.1 });
  const flight = phase(progress, ...STEPS.flight);
  fly(world.plane, flight, { station: STATIONS.launch, time: alive });
  world.ground.contacts[3]?.scale.setScalar(Math.max(1 - flight * 1.6, 0.001));
  stage(world, progress);
  poseFlock(world, phase(progress, ...STEPS.flock), alive);
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
  const drift = time * life * 0.8;
  world.key.position.set(
    focus.x - 3.4 + Math.cos(drift) * 1.8,
    focus.y + 1.5,
    focus.z + 2.6 + Math.sin(drift) * 1.8,
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
