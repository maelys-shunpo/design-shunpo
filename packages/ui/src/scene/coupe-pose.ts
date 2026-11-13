import type { Camera } from "three";
import { Vector3 } from "three";

import {
  GHOST_COUNT,
  ghostRaw,
  ghostVisible,
  partAt,
  shake,
  slideAt,
  slitOpacity,
  throwPosition,
  throwVisible,
} from "../motion/coupe-geometry.ts";
import { type CoupeCut, type CoupeWorld, SCREEN_HEIGHT } from "./coupe-world.ts";

/* The thrown star, a half world-unit across, spinning five turns across the page. */
const STAR_SIZE = 0.5;
const SPIN = Math.PI * 10;
/* How far along the normal a half travels as it falls: well past the screen's edge. */
const AWAY = 8;
/* The impact tremble, as a fraction of a world unit. */
const SHAKE = 0.08;

interface Span {
  from: number;
  to: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/* A point on the cut line at `x`, raised off the paper by `z` so the star and the slit draw over it. */
function cutPoint(cut: CoupeCut, x: number, z: number): Vector3 {
  const slope = cut.direction.y / cut.direction.x;
  return new Vector3(x, cut.center.y + (x - cut.center.x) * slope, z);
}

/* Where along the crossing a fraction (0 off one edge, 1 off the other) sits, raised to draw over the paper. */
function flightPoint(cut: CoupeCut, span: Span, fraction: number): Vector3 {
  return cutPoint(cut, span.from + (span.to - span.from) * clamp01(fraction), 0.05);
}

/* The star crosses from off one edge to off the other, its ghosts a step behind. */
function poseFlight(world: CoupeWorld, span: Span, progress: number): void {
  const { star, ghosts, cut } = world;
  star.visible = throwVisible(progress);
  star.position.copy(flightPoint(cut, span, throwPosition(progress)));
  star.scale.setScalar(STAR_SIZE);
  star.rotation.z = -throwPosition(progress) * SPIN;
  for (let index = 0; index < GHOST_COUNT; index += 1) {
    const ghost = ghosts[index];
    if (ghost === undefined) {
      continue;
    }
    const raw = ghostRaw(progress, index);
    ghost.visible = ghostVisible(progress, index);
    ghost.position.copy(flightPoint(cut, span, raw));
    ghost.scale.setScalar(STAR_SIZE);
    ghost.rotation.z = -clamp01(raw) * SPIN;
  }
}

/* The hairline left behind: from off the left edge to the star's head, fading after the beat. */
function poseSlit(world: CoupeWorld, span: Span, progress: number): void {
  const { slit, cut } = world;
  const opacity = slitOpacity(progress);
  slit.material.opacity = opacity;
  slit.visible = opacity > 0;
  const from = cutPoint(cut, span.from, 0.02);
  const head = flightPoint(cut, span, throwPosition(progress));
  const length = Math.max(0.001, from.distanceTo(head));
  slit.position.set((from.x + head.x) / 2, (from.y + head.y) / 2, 0.02);
  slit.rotation.z = Math.atan2(cut.direction.y, cut.direction.x);
  slit.scale.set(length, 0.02, 1);
}

/* The page giving way: the upper half slides down the cut first, then both fall apart, tilting as they go. */
function poseHalves(world: CoupeWorld, progress: number): void {
  const { halves, cut } = world;
  const slide = slideAt(progress);
  const part = partAt(progress);
  for (const half of halves) {
    const along = half.side > 0 ? slide * 0.32 + part * 1.2 : -part * 0.6;
    const away = half.side * (slide * 0.03 + part * AWAY);
    half.group.position.set(
      cut.center.x + cut.direction.x * along + cut.normal.x * away,
      cut.center.y + cut.direction.y * along + cut.normal.y * away,
      part * 0.3,
    );
    half.group.rotation.set(-half.side * part * 0.25, 0, half.side * part * 0.12);
    half.front.color.setScalar(1 - part * 0.12);
  }
}

/* Poses the whole coupe from the scroll's progress, and trembles the camera at the impact. */
export function poseCoupe(
  world: CoupeWorld,
  camera: Camera,
  options: { aspect: number; progress: number },
): void {
  const { aspect, progress } = options;
  const halfWidth = (SCREEN_HEIGHT / 2) * aspect;
  const span: Span = { from: -halfWidth - 1, to: halfWidth + 1 };
  poseFlight(world, span, progress);
  poseSlit(world, span, progress);
  poseHalves(world, progress);
  const offset = shake(progress) * SHAKE;
  const { position } = camera;
  position.x = offset;
  position.y = offset * 0.6;
}
