import {
  Color,
  DataTexture,
  DoubleSide,
  LinearFilter,
  LineBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  RGBAFormat,
  type Vector3,
} from "three";

import type { QualityTier } from "../lib/quality-tier.ts";

const GRAIN_SIZE = 128;

/* An integer hash (PCG): the same fibres on every load, so the first frame stays the poster's. */
function hash(value: number): number {
  let state = Math.imul(value >>> 0, 747_796_405) + 2_891_336_453;
  state = Math.imul((state >>> ((state >>> 28) + 4)) ^ state, 277_803_737);
  return ((state >>> 22) ^ state) >>> 0;
}

/* Washi-like grain: fine speckle and rare fibres, as a bump map the light grazes. */
export function createPaperGrain(): DataTexture {
  const data = new Uint8Array(GRAIN_SIZE * GRAIN_SIZE * 4);
  for (let index = 0; index < GRAIN_SIZE * GRAIN_SIZE; index += 1) {
    const speck = (hash(index) % 255) / 255;
    const fibre = hash(index * 31 + 7) % 997 === 0 ? 50 : 0;
    const level = Math.round(170 + speck * 30 + fibre);
    data.set([level, level, level, 255], index * 4);
  }
  const texture = new DataTexture(data, GRAIN_SIZE, GRAIN_SIZE, RGBAFormat);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

export interface PaperColours {
  front: Color;
  back: Color;
  /* The direction toward the back light, in view space, shared by every paper and updated each frame. */
  backlight: { value: Vector3 };
}

/* Origami paper is coloured on one side and white on the other: the fragment reads which face it draws.
   It is thin, too: light behind a facet glows through it, warmer than the light that falls on its face. */
function twoSided(material: MeshStandardMaterial, colours: PaperColours): void {
  Object.assign(material, {
    onBeforeCompile: (shader: { uniforms: object; fragmentShader: string }) => {
      Object.assign(shader.uniforms, {
        uBack: { value: colours.back },
        uBacklight: colours.backlight,
      });
      Object.assign(shader, {
        fragmentShader: `uniform vec3 uBack;\nuniform vec3 uBacklight;\n${shader.fragmentShader
          .replace(
            "vec4 diffuseColor = vec4( diffuse, opacity );",
            "vec4 diffuseColor = vec4( gl_FrontFacing ? diffuse : uBack, opacity );",
          )
          .replace("#include <map_fragment>", "if ( gl_FrontFacing ) {\n#include <map_fragment>\n}")
          .replace(
            "#include <opaque_fragment>",
            "outgoingLight += diffuseColor.rgb * vec3(1.0, 0.9, 0.74) * 0.42 * pow(max(dot(-normal, uBacklight), 0.0), 1.4);\n#include <opaque_fragment>",
          )}`,
      });
    },
    customProgramCacheKey: () => "origami-paper",
  });
}

/* Paper: matte, a soft sheen at grazing angles on the full tier, fibres in the bump. */
export function createPaper(
  colours: PaperColours,
  grain: DataTexture,
  tier: QualityTier,
): MeshStandardMaterial {
  const shared = {
    color: colours.front,
    roughness: 0.78,
    metalness: 0,
    side: DoubleSide,
    bumpMap: grain,
    bumpScale: tier === "full" ? 0.7 : 0.35,
    flatShading: true,
  };
  const material =
    tier === "full"
      ? new MeshPhysicalMaterial({
          ...shared,
          sheen: 0.55,
          sheenRoughness: 0.7,
          sheenColor: new Color(1, 0.97, 0.9),
        })
      : new MeshStandardMaterial(shared);
  twoSided(material, colours);
  return material;
}

/* The crease lines: a pale hairline where the paper bends, the light catching the ridge of every fold. */
export function createCreases(): LineBasicMaterial {
  return new LineBasicMaterial({
    color: new Color(1, 0.95, 0.86),
    transparent: true,
    opacity: 0.5,
  });
}
