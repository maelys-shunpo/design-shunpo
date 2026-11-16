import { MathUtils, type Object3D, type Vector2 } from "three";

import type { Calibre } from "./mecanique-calibre.ts";

/* Per-frame motion of the calibre, outside React: the React Compiler lint rejects writes to hook values in
   useFrame. Progress phases overlap (smoothstep windows), so assembly, running and the dial read as one gesture.

   0.00–0.10  dead zone: the exploded view the poster shows, floating
   0.10–0.58  assembly, part by part, in the order a watchmaker would place them
   0.46–0.66  the movement starts: the train turns, the escapement ticks, the balance beats
   0.74–0.94  the dial comes down over the running movement; the camera faces it */

const TAU = Math.PI * 2;
const ASSEMBLY_START = 0.1;
const ASSEMBLY_STEP = 0.026;
const ASSEMBLY_SPAN = 0.15;
const ESCAPE_TEETH = 15;
const ESCAPE_TICKS_PER_SECOND = 5;
const BALANCE_HERTZ = 2.5;

function smooth(from: number, to: number, value: number): number {
  return MathUtils.smoothstep(value, from, to);
}

/* A precise placement: slow start, fast travel, a soft landing (power-3 in-out). */
function place(value: number): number {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
}

export interface CalibreFrame {
  progress: number;
  time: number;
  delta: number;
}

export function assemblyOf(order: number, progress: number): number {
  const start = ASSEMBLY_START + order * ASSEMBLY_STEP;
  return place(MathUtils.clamp((progress - start) / ASSEMBLY_SPAN, 0, 1));
}

export function runOf(progress: number): number {
  return smooth(0.46, 0.66, progress);
}

export function dialOf(progress: number): number {
  return smooth(0.74, 0.94, progress);
}

function poseParts(calibre: Calibre, { progress, time }: CalibreFrame): void {
  for (const part of calibre.parts) {
    const assembled = assemblyOf(part.order, progress);
    const floating = (1 - assembled) * Math.sin(time * 0.7 + part.order * 1.3) * 0.03;
    part.object.position.lerpVectors(part.exploded, part.home, assembled);
    part.object.position.z += floating;
    part.object.rotation.x = (1 - assembled) * Math.sin(part.order * 2.1) * 0.12;
    part.object.rotation.y = (1 - assembled) * Math.cos(part.order * 1.7) * 0.12;
  }
}

/* The escape wheel moves in ticks: a jump, then a rest, five times a second. */
function escapeAngle(running: number): number {
  const ticks = running * ESCAPE_TICKS_PER_SECOND;
  const within = MathUtils.smoothstep(ticks % 1, 0, 0.22);
  return -(Math.floor(ticks) + within) * (TAU / ESCAPE_TEETH);
}

function poseMovement(calibre: Calibre, run: number): void {
  const { running, escape, balance, train } = calibre;
  for (const { object, speed } of train) {
    object.rotation.z = speed * running * TAU * 0.1;
  }
  escape.rotation.z = escapeAngle(running);
  balance.rotation.z = Math.sin(running * BALANCE_HERTZ * TAU) * 1.4 * run;
}

function poseDial(calibre: Calibre, frame: CalibreFrame): void {
  const { dial, hands, running } = calibre;
  const shown = dialOf(frame.progress);
  dial.visible = shown > 0.001;
  dial.position.z = MathUtils.lerp(2.4, 0.32, place(shown));
  dial.rotation.x = (1 - shown) * 0.5;
  /* Set at ten past ten, the watchmaker's resting time, then running with the movement. */
  const seconds = 32 + running;
  const minutes = 9 + seconds / 60;
  hands.second.rotation.z = (-seconds / 60) * TAU;
  hands.minute.rotation.z = (-minutes / 60) * TAU;
  hands.hour.rotation.z = (-(10 + minutes / 60) / 12) * TAU;
}

export function poseCalibre(calibre: Calibre, frame: CalibreFrame): void {
  const run = runOf(frame.progress);
  Object.assign(calibre, { running: calibre.running + frame.delta * run });
  poseParts(calibre, frame);
  poseMovement(calibre, run);
  poseDial(calibre, frame);
}

export interface CameraView {
  progress: number;
  pointer: Vector2;
  /* Width over height of the canvas: a tall phone frame steps the camera back. */
  aspect: number;
}

/* A three-quarter view of the exploded stack that turns, as the parts land, to face the dial. */
export function poseCamera(camera: Object3D, { progress, pointer, aspect }: CameraView): void {
  const settle = smooth(0.08, 0.6, progress);
  const face = smooth(0.7, 0.98, progress);
  const pitch = MathUtils.lerp(MathUtils.lerp(0.95, 0.72, settle), 0.02, face) + pointer.y * 0.08;
  const yaw = MathUtils.lerp(MathUtils.lerp(-0.42, 0.18, settle), 0, face) + pointer.x * 0.12;
  const distance = MathUtils.lerp(MathUtils.lerp(6.7, 5.4, settle), 5, face) / Math.min(aspect, 1);
  camera.position.set(
    distance * Math.sin(yaw) * Math.cos(pitch),
    -distance * Math.sin(pitch),
    distance * Math.cos(yaw) * Math.cos(pitch),
  );
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, MathUtils.lerp(0.62, 0.12, settle));
}
