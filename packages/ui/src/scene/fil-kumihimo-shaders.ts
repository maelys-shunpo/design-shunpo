import { ShaderMaterial, Vector2, Vector3 } from "three";

import type { QualityTier } from "../lib/quality-tier.ts";
import { BUCKETS, createStrands, redThreadOf, ROWS } from "./fil-kumihimo-strands.ts";
import { weaveStrands } from "./fil-kumihimo-weave.ts";
import { COVER_UV, FULL_SCREEN, INTERLEAVED_GRADIENT_NOISE } from "./shader-chunks.ts";

/* Threads drawn per pixel: the cost knob of the scene. The light tier braids fewer, thicker threads. */
const THREADS: Record<QualityTier, number> = { light: 22, full: 38 };
const WIDTH: Record<QualityTier, number> = { light: 0.0058, full: 0.0046 };

/* The threads' curves are laid on the CPU once per frame into a table of THREADS columns by ROWS rows (x, slope,
   depth, ink): per pixel, the shader reads which threads can reach its column (a bit mask) and blends two rows
   of those only. Per pixel, the two threads in
   front are kept, so a thread passes over and under its neighbours with the shadow of the one above. */
const fragmentShader = `
  precision highp usampler2D;
  uniform sampler2D uStrands;
  uniform usampler2D uMask;
  uniform vec2 uResolution;
  uniform float uPosterAspect;
  uniform float uWidth;
  uniform vec3 uGround;
  uniform vec3 uPalette[6];
  ${COVER_UV}
  ${INTERLEAVED_GRADIENT_NOISE}

  void main() {
    vec2 uv = coverUv(gl_FragCoord.xy, uResolution, uPosterAspect);
    vec2 p = vec2(uv.x * uPosterAspect, uv.y);
    float aa = 1.4 / uResolution.y;
    float row = clamp(p.y, 0.0, 1.0) * float(ROWS - 1);
    int below0 = int(floor(row));
    int above0 = min(below0 + 1, ROWS - 1);
    float between = row - float(below0);
    int column = clamp(int(p.x / uPosterAspect * float(BUCKETS)), 0, BUCKETS - 1);
    uvec2 near = texelFetch(uMask, ivec2(column, below0), 0).xy;

    vec4 top = vec4(0.0);
    vec4 below = vec4(0.0);
    float topDepth = -9.0;
    float belowDepth = -9.0;
    float topHalo = 0.0;
    float groundShadow = 0.0;

    for (int i = 0; i < THREADS; i++) {
      uint word = i < 32 ? near.x : near.y;
      if (((word >> uint(i & 31)) & 1u) == 0u) continue;
      vec4 strand = mix(
        texelFetch(uStrands, ivec2(i, below0), 0),
        texelFetch(uStrands, ivec2(i, above0), 0),
        between
      );
      float width = uWidth * (i == RED_THREAD ? 1.25 : 1.0);
      float offset = p.x - strand.x;
      if (abs(offset) > width * 5.0 + 0.0035) continue;
      groundShadow = max(groundShadow, (1.0 - smoothstep(width, width * 5.0, abs(offset - 0.0035))) * 0.16);
      float gap = abs(offset) * inversesqrt(1.0 + strand.y * strand.y);
      float cover = 1.0 - smoothstep(width - aa, width + aa, gap);
      if (cover <= 0.0) continue;
      float across = clamp(gap / width, 0.0, 1.0);
      float round = sqrt(1.0 - across * across);
      float fibre = 0.93 + 0.07 * sin((p.y - p.x * 0.35) * 1400.0 + float(i) * 3.1);
      vec3 ink = uPalette[int(strand.w + 0.5)] * (0.62 + 0.38 * round) * fibre + vec3(0.22) * pow(round, 12.0);
      float depth = strand.z;
      if (depth > topDepth) {
        below = top;
        belowDepth = topDepth;
        top = vec4(ink, cover);
        topDepth = depth;
        topHalo = 1.0 - smoothstep(width, width * 3.2, gap);
      } else if (depth > belowDepth) {
        below = vec4(ink, cover);
        belowDepth = depth;
      }
    }

    vec3 color = uGround * (1.0 - groundShadow);
    color = mix(color, below.rgb, below.a);
    color *= 1.0 - 0.32 * topHalo * (1.0 - top.a) * below.a;
    color = mix(color, top.rgb, top.a);
    color += (interleavedGradientNoise(gl_FragCoord.xy) - 0.5) * 0.025;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export interface KumihimoColours {
  ground: Vector3;
  inks: Vector3[];
  red: Vector3;
}

/* Token colours are sRGB; the shader blends in linear light and colorspace_fragment encodes the result back. */
export function toLinear(channel: number): number {
  return channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function rgb(hex: number): Vector3 {
  return new Vector3(
    toLinear(((hex >> 16) & 255) / 255),
    toLinear(((hex >> 8) & 255) / 255),
    toLinear((hex & 255) / 255),
  );
}

/* Fallback colours (Kome ground, Tenku and Fuji inks, one Fushimi thread) until the scene reads the tokens. */
export function defaultColours(): KumihimoColours {
  return {
    ground: rgb(0xf3_f0_e9),
    inks: [0x2b_71_8c, 0x1e_26_29, 0x1f_63_7d, 0x7a_b6_cc, 0xbd_c8_cc].map((hex) => rgb(hex)),
    red: rgb(0xb9_45_32),
  };
}

/* Built imperatively: the material keeps this very uniforms object, while R3F's uniforms prop copies it. The
   palette holds the same vectors as uInks and uRed, so reading the tokens into those recolours the threads.
   uTime, uProgress, uPull and uPointer are the frame's state, read by weave() on the CPU. */
export function createKumihimo(pointer: Vector2, tier: QualityTier, posterAspect: number) {
  const colours = defaultColours();
  const threads = THREADS[tier];
  const strands = createStrands(threads, posterAspect, WIDTH[tier]);
  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPull: { value: 0 },
    uPointer: { value: pointer },
    uResolution: { value: new Vector2(1, 1) },
    uPosterAspect: { value: posterAspect },
    uWidth: { value: WIDTH[tier] },
    uStrands: { value: strands.texture },
    uMask: { value: strands.maskTexture },
    uGround: { value: colours.ground },
    uInks: { value: colours.inks },
    uRed: { value: colours.red },
    uPalette: { value: [...colours.inks, colours.red] },
  };
  const material = new ShaderMaterial({
    uniforms,
    defines: { THREADS: threads, RED_THREAD: redThreadOf(threads), ROWS, BUCKETS },
    vertexShader: FULL_SCREEN,
    fragmentShader,
  });
  return { material, uniforms, strands };
}

export type Kumihimo = ReturnType<typeof createKumihimo>;

/* Lays the threads for the frame the uniforms describe. */
export function weave({ strands, uniforms }: Kumihimo): void {
  weaveStrands(strands, {
    time: uniforms.uTime.value,
    progress: uniforms.uProgress.value,
    pull: uniforms.uPull.value,
    pointer: uniforms.uPointer.value,
    resolution: uniforms.uResolution.value,
    posterAspect: uniforms.uPosterAspect.value,
  });
}

export function disposeKumihimo({ material, strands }: Kumihimo): void {
  material.dispose();
  strands.texture.dispose();
  strands.maskTexture.dispose();
}
