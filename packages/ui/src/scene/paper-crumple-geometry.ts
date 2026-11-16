import { PlaneGeometry, Vector4 } from "three";

import type { Crease } from "../agents/paper-crumple-model.ts";
import type { QualityTier } from "../lib/quality-tier.ts";

/* The vec4 slots the shader reserves for creases (u, v, angle, depth): more than MAX_CRUMPLES × creases-per-crumple
   plus the arrival creases, so the paper never runs out of folds to remember. */
export const CREASE_UNIFORM_SLOTS = 24;

export interface CrumpleGeometry {
  geometry: PlaneGeometry;
  segments: number;
}

/* How finely the sheet is subdivided per tier: enough facets for creases to read as folds, fewer on light devices. */
const SEGMENTS: Record<QualityTier, number> = {
  light: 48,
  full: 96,
};

/* A unit plane (1 × 1 in world units, scaled by the world) subdivided so the vertex shader can fold it. */
export function buildCrumpleGeometry(tier: QualityTier): CrumpleGeometry {
  const segments = SEGMENTS[tier];
  const geometry = new PlaneGeometry(1, 1, segments, segments);
  return { geometry, segments };
}

/* Packs the crease list into a fixed-size vec4 array (u, v, angle, depth) for the shader uniform: extra creases past
   the cap are dropped, unused slots stay zero (depth 0 means « no crease », so the shader ignores them). */
export function packCreases(creases: readonly Crease[]): Vector4[] {
  const packed: Vector4[] = [];
  for (let slot = 0; slot < CREASE_UNIFORM_SLOTS; slot++) {
    const crease = creases[slot];
    packed.push(
      crease === undefined
        ? new Vector4(0, 0, 0, 0)
        : new Vector4(crease.u, crease.v, crease.angle, crease.depth),
    );
  }
  return packed;
}
