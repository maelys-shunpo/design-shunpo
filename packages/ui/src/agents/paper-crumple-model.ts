/* The 404 sheet's crumple model: pure numbers, no three.js. A damped spring drives how crumpled the sheet is, creases
   accumulate as it is crumpled again (capped), and a client point maps to the sheet's own UV space.
   Technique reimplemented from React Bits `PaperCrumple` (MIT + Commons Clause), not copied. */

/* The most times the visitor can crumple the sheet before the paper stays at that wear. */
export const MAX_CRUMPLES = 5;

/* A fold line seeded in the sheet's UV space ([0,1]²), with a direction and a depth. */
export interface Crease {
  u: number;
  v: number;
  angle: number;
  depth: number;
}

export interface CrumpleState {
  count: number;
  creases: readonly Crease[];
}

export interface SpringState {
  value: number;
  velocity: number;
}

/* The spring's constants and the frame's elapsed seconds, grouped (lint caps a function at three parameters). */
export interface SpringStep {
  stiffness: number;
  damping: number;
  dt: number;
}

/* A semi-implicit (symplectic) Euler step of a damped spring: stable, and it settles on the target with velocity zero. */
export function stepSpring(state: SpringState, target: number, step: SpringStep): SpringState {
  const acceleration = step.stiffness * (target - state.value) - step.damping * state.velocity;
  const velocity = state.velocity + acceleration * step.dt;
  const value = state.value + velocity * step.dt;
  return { value, velocity };
}

/* How many fold lines one crumple adds. */
const CREASES_PER_CRUMPLE = 3;
/* How far a crease strays from the point crumpled, in UV. */
const CREASE_SPREAD = 0.25;

/* A deterministic PRNG (mulberry32): the same seed always draws the same creases, so a crumple replays identically. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/* Adds one crumple's creases around `at`, up to the cap. At the cap the paper keeps its wear: the same state is returned. */
export function addCrumple(
  state: CrumpleState,
  at: { u: number; v: number },
  seed: number,
): CrumpleState {
  if (state.count >= MAX_CRUMPLES) {
    return state;
  }
  const random = mulberry32(seed);
  const fresh: Crease[] = [];
  for (let i = 0; i < CREASES_PER_CRUMPLE; i++) {
    fresh.push({
      u: clamp01(at.u + (random() - 0.5) * CREASE_SPREAD),
      v: clamp01(at.v + (random() - 0.5) * CREASE_SPREAD),
      angle: random() * Math.PI * 2,
      depth: 0.5 + random() * 0.5,
    });
  }
  return { count: state.count + 1, creases: [...state.creases, ...fresh] };
}

/* Maps a client point to the sheet's UV ([0,1]²), or null when the point is outside the sheet's box. */
export function pointerToSheetUv(
  pointer: { x: number; y: number },
  rect: { left: number; top: number; width: number; height: number },
): { u: number; v: number } | null {
  const u = (pointer.x - rect.left) / rect.width;
  const v = (pointer.y - rect.top) / rect.height;
  if (u < 0 || u > 1 || v < 0 || v > 1) {
    return null;
  }
  return { u, v };
}
