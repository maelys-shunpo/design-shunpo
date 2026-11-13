import { type Camera, type Vector2, Vector3 } from "three";

import { CONTACT } from "./agents-shuriken-ground.ts";
import {
  branchPose,
  cameraShot,
  LIFT,
  lockOf,
  phase,
  signPose,
  STEPS,
} from "./agents-shuriken-motion.ts";
import { BRANCH, branchPattern } from "./agents-shuriken-pattern.ts";
import type { ShurikenWorld } from "./agents-shuriken-world.ts";
import { foldAmount, setFold } from "./origami-folds.ts";

export interface ShurikenFrame {
  delta: number;
  progress: number;
  pointer: Vector2;
}

const RIDGE_WINDOW = branchPattern().find((facet) => facet.id === "core-right")?.window ?? [0.7, 1];
/* Paper rests a hair above its own contact shadow. */
const ON_FLOOR = 0.012;
/* Once the ridge is folded, a point stands on the edges of its halves: the ridge rises by as much as they fall. */
const RIDGE_RISE = BRANCH.valleyRight[0] * Math.sin(BRANCH.ridge / 2);
/* The contact shadows: a soft disc under each sheet, one under the whole sign, a wider one under the pebble. */
const SHEET_SHADOW = 0.46;
const SIGN_SHADOW = 0.95;
const PEBBLE_SHADOW = 1.25;
/* Interlocked paper stacks: each point lies a breath above the one before it, so overlaps never flicker. */
const STACK = 0.003;
/* How far a draft lifts a loose sheet off the floor. */
const HOVER = 0.03;
/* Once the points lock, their ridges press down to a shallow crease, so no slit opens between neighbours. */
const PRESSED = 0.6;

/* Life at rest starts from zero on the first frame and fades in, so the first frame stays the poster's. */
function lifeAt(time: number): number {
  return Math.min(Math.max((time - 0.1) / 1.5, 0), 1);
}

interface Breath {
  alive: number;
  life: number;
  progress: number;
}

/* A sheet's pose: placed and turned on the floor, its flaps pre-creased and lifting slowly at rest, its ridge
   rolled level so both halves of the point fall away from the axis alike. */
function poseBranch(world: ShurikenWorld, index: number, breath: Breath): void {
  const branch = world.branches[index];
  if (branch === undefined) {
    return;
  }
  const { alive, life, progress } = breath;
  const pose = branchPose(index, progress);
  const locked = lockOf(progress);
  const ridged = foldAmount(pose.fold, RIDGE_WINDOW) * (1 - PRESSED * locked);
  /* A draft lifts a loose sheet a breath off the floor and lets it down again; a locked point stays put. */
  const draft = life * (1 - locked) * HOVER * (0.5 + 0.5 * Math.sin(alive * 1.3 + index * 2.1));
  branch.holder.position.set(
    pose.x,
    pose.y + draft + ON_FLOOR + index * STACK + RIDGE_RISE * ridged,
    pose.z,
  );
  branch.holder.rotation.set(0, pose.yaw + Math.sin(alive * 0.9 + index * 2.3) * 0.05 * life, 0);
  setFold(branch.piece.facets, pose.fold, {
    flutter: Math.sin(alive * 1.9 + index) * 0.08 * life,
    /* The flaps of a laid sheet curl up and settle, as paper does in a draft. */
    rest: 0.035 + 0.15 * life * (0.5 + 0.5 * Math.sin(alive * 1.7 + index * 1.9)),
  });
  /* The ridge itself presses down with the lock, and the point rolls by half of it: both halves fall alike. */
  const ridge = branch.piece.facets.find((facet) => facet.id === "core-right");
  ridge?.pivot.quaternion.setFromAxisAngle(ridge.axis, ridge.angle * ridged);
  branch.piece.root.rotation.set(0, 0, pose.bank + (BRANCH.ridge * ridged) / 2);
  /* A lifted sheet's shadow spreads and pales; once the sign is whole, one shadow takes over under it. */
  const shadow = world.ground.sheets[index];
  if (shadow !== undefined) {
    shadow.position.set(
      pose.x - Math.sin(pose.yaw) * 0.5,
      0.001,
      pose.z - Math.cos(pose.yaw) * 0.5,
    );
    shadow.scale.setScalar(SHEET_SHADOW * (1 + pose.y * 0.9 + draft * 4));
    shadow.material.opacity = CONTACT * (1 - (0.7 * pose.y) / LIFT - draft * 6) * (1 - locked);
  }
}

/* The sign, once whole, floats a hair over its pebble and sways; the pebble grows out from under it. */
function poseSign(world: ShurikenWorld, { alive, life, progress }: Breath): void {
  const pose = signPose(progress);
  const locked = lockOf(progress);
  const settled = phase(progress, STEPS.gather[1] - 0.04, STEPS.gather[1] + 0.02) * life;
  world.sign.position.setY(pose.lift + settled * (0.5 + 0.5 * Math.sin(alive * 0.9)) * 0.025);
  world.sign.rotation.set(0, pose.spin + settled * Math.sin(alive * 0.9) * 0.07, 0);
  Object.assign(world.pebble, { visible: pose.pebble > 0 });
  world.pebble.scale.set(Math.max(pose.pebble, 0.001), 1, Math.max(pose.pebble, 0.001));
  world.pebble.rotation.set(0, (1 - pose.pebble) * 0.6, 0);
  const { sign, pebble } = world.ground;
  sign.position.set(0, 0.001, 0);
  sign.scale.setScalar(SIGN_SHADOW);
  sign.material.opacity = CONTACT * locked * (1 - pose.pebble);
  pebble.position.set(0, 0.001, 0);
  pebble.scale.setScalar(PEBBLE_SHADOW * Math.max(pose.pebble, 0.001));
  pebble.material.opacity = CONTACT * Math.min(pose.pebble * 2, 1);
}

const towardRim = new Vector3();
const UP = new Vector3(0, 1, 0);
const BACK = new Vector3(0, 0, -1);

/* A warm key from the front left that drifts slowly, a cool rim from behind that shines through the paper. */
function poseLights(world: ShurikenWorld, camera: Camera, alive: number): void {
  const drift = alive * 1.4;
  world.key.position.set(
    -3 + Math.cos(drift) * 2.2,
    4.6 + Math.sin(drift * 0.7) * 0.9,
    2.4 + Math.sin(drift) * 2.2,
  );
  world.key.target.position.set(0, 0, 0);
  world.rim.position.set(2.6, 2.4, -4.6);
  world.rim.target.position.set(0, 0, 0);
  camera.updateMatrixWorld();
  world.papers.backlight.value.copy(
    towardRim.copy(world.rim.position).transformDirection(camera.matrixWorldInverse),
  );
}

/* The shot of the scroll, the pointer's parallax on top of it, the camera's up turning from the sky to the back
   of the floor as it rises to face the sign. */
function poseCamera(camera: Camera, progress: number, pointer: Vector2): void {
  const { position, target } = cameraShot(progress);
  const above = phase(progress, STEPS.pebble[1], STEPS.snap[1]);
  const sway = 1 - above * 0.6;
  camera.up.copy(UP).lerp(BACK, above).normalize();
  camera.position.set(
    position[0] + pointer.x * 0.35 * sway,
    position[1],
    position[2] - pointer.y * 0.22 * sway,
  );
  camera.lookAt(target[0], target[1], target[2]);
}

/* One frame: the scene's clock advances by the frame's delta (a paused stage holds it), then the sheets, the
   sign, the lights and the camera take their pose. */
export function poseShuriken(world: ShurikenWorld, camera: Camera, frame: ShurikenFrame): void {
  Object.assign(world.clock, { time: world.clock.time + frame.delta });
  const life = lifeAt(world.clock.time);
  const breath = { alive: world.clock.time * life, life, progress: frame.progress };
  for (const index of world.branches.keys()) {
    poseBranch(world, index, breath);
  }
  poseSign(world, breath);
  poseCamera(camera, frame.progress, frame.pointer);
  poseLights(world, camera, breath.alive);
}
