import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
} from "three";

import type { Rgb } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { buildDrawings, DRAWING_COUNT } from "./instant-drawings.ts";
import { INSTANT_FRAGMENT, INSTANT_VERTEX } from "./instant-shaders.ts";
import { unit } from "./instant-shapes.ts";

/* Fewer, larger dots on light devices keep the same coverage of ink. */
export const PARTICLES: Record<QualityTier, number> = { light: 14_336, full: 32_768 };
const POINT_SIZE: Record<QualityTier, number> = { light: 3.4, full: 2.3 };
/* Ghost layers trail the jump, each a little behind the last; light devices draw one. */
const GHOST_LAGS: Record<QualityTier, number[]> = { light: [0.012], full: [0.008, 0.016, 0.026] };

export interface InstantLook {
  ink: Rgb;
  seal: Rgb;
}

function linear([red, green, blue]: Rgb): Color {
  return new Color().setRGB(red / 255, green / 255, blue / 255, SRGBColorSpace);
}

export function createGeometry(count: number): BufferGeometry {
  const drawings = buildDrawings(count);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
  const [week, tools, system, time] = drawings;
  geometry.setAttribute("aWeek", new BufferAttribute(week.points, 2));
  geometry.setAttribute("aTools", new BufferAttribute(tools.points, 2));
  geometry.setAttribute("aSystem", new BufferAttribute(system.points, 2));
  geometry.setAttribute("aTime", new BufferAttribute(time.points, 2));
  geometry.setAttribute("aRed", new BufferAttribute(time.red, 1));
  const seeds = Float32Array.from({ length: count }, (_, index) => unit(index, 101));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
  return geometry;
}

/* The uniforms every layer shares: one object, so a write reaches the head and its ghosts alike. */
function createUniforms(tier: QualityTier, pixelRatio: number, look: InstantLook) {
  return {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uLayout: { value: new Vector3(0, 0, 0.8) },
    uPointer: { value: new Vector3(0, 0, 0) },
    uPointSize: { value: POINT_SIZE[tier] * pixelRatio },
    uInk: { value: linear(look.ink) },
    uSeal: { value: linear(look.seal) },
  };
}

export type InstantUniforms = ReturnType<typeof createUniforms>;

function layerMaterial(uniforms: InstantUniforms, lag: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { ...uniforms, uLag: { value: lag } },
    defines: { DRAWINGS: DRAWING_COUNT },
    vertexShader: INSTANT_VERTEX,
    fragmentShader: INSTANT_FRAGMENT,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: NormalBlending,
  });
}

/* Everything the scene draws with, made and released together (useSceneResource): ghosts first, the head on top. */
export function createInk(tier: QualityTier, pixelRatio: number, look: InstantLook) {
  const geometry = createGeometry(PARTICLES[tier]);
  const uniforms = createUniforms(tier, pixelRatio, look);
  const materials = [...GHOST_LAGS[tier].toReversed(), 0].map((lag) =>
    layerMaterial(uniforms, lag),
  );
  return { geometry, uniforms, materials };
}

export type Ink = ReturnType<typeof createInk>;

export function disposeInk({ geometry, materials }: Ink): void {
  geometry.dispose();
  for (const material of materials) {
    material.dispose();
  }
}

/* Where the drawing sits on the canvas: to the right of the copy in landscape, in the upper half in portrait (the posters switch on the same orientation).
   x and y are its centre in clip space, z its half-height. */
export function layoutFor(aspect: number): [x: number, y: number, scale: number] {
  if (aspect >= 1) {
    const scale = Math.min(0.74, aspect * 0.5);
    return [Math.min(0.32, 0.9 - scale / aspect), -0.02, scale];
  }
  const scale = Math.min(0.8 * aspect, 0.3);
  return [0, 0.9 - scale, scale];
}

/* Mutations live outside the component: the React Compiler lint rejects writing to hook values in useFrame.
   The first frame always gets a 0.1 s delta, so it draws at uTime 0.1 on every load: the frame the poster shows. */
export function advance(
  uniforms: InstantUniforms,
  frame: { delta: number; progress: number; width: number; height: number },
): void {
  const { uTime, uProgress, uAspect, uLayout } = uniforms;
  const aspect = frame.width / Math.max(frame.height, 1);
  uTime.value += frame.delta;
  uProgress.value = frame.progress;
  uAspect.value = aspect;
  uLayout.value.set(...layoutFor(aspect));
}
