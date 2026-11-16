import type { Flat } from "./origami-folds.ts";

/* Shared helpers of the crease patterns. */

export const HALF_PI = Math.PI / 2;
/* Just short of flat: two layers laid face to face stay a hair apart instead of fighting for the same pixels. */
export const OVER = Math.PI * 0.985;

export function mirrorX(points: readonly Flat[]): Flat[] {
  return points.map(([x, y]) => [-x, y] as const);
}

export function mirrorY(points: readonly Flat[]): Flat[] {
  return points.map(([x, y]) => [x, -y] as const);
}

export function hingeOf(points: readonly Flat[]): readonly [Flat, Flat] {
  const [first = [0, 0], second = [1, 0]] = points;
  return [first, second];
}

/* A quarter turn of the sheet's plane, exact: cos and sin of a multiple of 90° are -1, 0 or 1. */
export function turnQuarter([x, y]: Flat, quarter: number): Flat {
  const angle = quarter * HALF_PI;
  const cos = Math.round(Math.cos(angle));
  const sin = Math.round(Math.sin(angle));
  return [x * cos - y * sin, x * sin + y * cos];
}
