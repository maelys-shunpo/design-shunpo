import {
  DataTexture,
  FloatType,
  NearestFilter,
  RGBAFormat,
  RGIntegerFormat,
  UnsignedIntType,
} from "three";

/* Rows of the strand table, from the bottom of the poster (y = 0) to its top (y = 1). Linear interpolation between
   rows stays under a tenth of a pixel at 900 px for the tightest curve (the braid's 34 rad per unit). */
export const ROWS = 512;
/* Columns of the reach mask: per row and column, two 32-bit words flag the threads that may touch it, so a pixel
   reads only those threads instead of all of them. */
export const BUCKETS = 64;

/* Every tunable of the look, in poster units (the poster's height is 1). */
export const kumihimoLook = {
  /* Where the cord hangs, as a share of the visible width on landscape screens. */
  cordX: 0.64,
  /* Height where the threads leave the fan of bobbins and close into the cord. */
  braidPoint: 0.74,
  cordRadius: 0.042,
  combedWidth: 0.42,
  fanWidth: 1.15,
} as const;

/* PCG hash (Jarzynski and Olano, JCGT 2020), the same integers as the shader chunk: thread i draws the same curve. */
function pcg(value: number): number {
  const state = (Math.imul(value >>> 0, 747_796_405) + 2_891_336_453) >>> 0;
  const word = Math.imul(((state >>> ((state >>> 28) + 4)) ^ state) >>> 0, 277_803_737) >>> 0;
  return ((word >>> 22) ^ word) >>> 0;
}

function rand(thread: number, salt: number): number {
  return pcg(thread * 7919 + salt * 104_729 + 17) / 4_294_967_295;
}

export interface Thread {
  index: number;
  share: number;
  base: number;
  tilt: number;
  a1: number;
  w1: number;
  p1: number;
  a2: number;
  w2: number;
  p2: number;
  stagger: number;
  turn: number;
  phase: number;
  rest: number;
  lift: number;
}

function threadAt(index: number, threads: number, aspect: number): Thread {
  const share = (index + 0.5) / threads;
  return {
    index,
    share,
    base: (0.04 + 0.92 * rand(index, 0)) * aspect,
    tilt: (rand(index, 1) - 0.5) * 1.8,
    a1: 0.16 + 0.22 * rand(index, 2),
    w1: 1.8 + 3.6 * rand(index, 3),
    p1: 6.2831 * rand(index, 4),
    a2: 0.04 + 0.06 * rand(index, 5),
    w2: 6 + 7 * rand(index, 6),
    p2: 6.2831 * rand(index, 7),
    stagger: (rand(index, 8) - 0.5) * 0.12,
    turn: index % 2 === 0 ? 1 : -1,
    phase: 6.2831 * share * 2,
    rest: 0.3 * Math.sin(index * 2.39),
    lift: index === redThreadOf(threads) ? 0.45 : 0,
  };
}

export function redThreadOf(threads: number): number {
  return Math.floor(threads * 0.55);
}

/* Which ink each thread is spun in: an index into the five inks, or 5 for the red thread. */
export function inkOf(index: number, threads: number): number {
  if (index === redThreadOf(threads)) {
    return 5;
  }
  const pick = rand(index, 9);
  const bounds = [0.3, 0.5, 0.72, 0.88];
  const found = bounds.findIndex((bound) => pick < bound);
  return found === -1 ? 4 : found;
}

export interface Strands {
  threads: Thread[];
  data: Float32Array;
  texture: DataTexture;
  mask: Uint32Array;
  maskTexture: DataTexture;
  /* How far from its centre a thread can touch a pixel (its widest cover or shadow), in poster units. */
  reach: number;
  posterAspect: number;
}

function createMask(): { mask: Uint32Array; maskTexture: DataTexture } {
  const mask = new Uint32Array(BUCKETS * ROWS * 2);
  const maskTexture = new DataTexture(mask, BUCKETS, ROWS, RGIntegerFormat, UnsignedIntType);
  maskTexture.internalFormat = "RG32UI";
  maskTexture.minFilter = NearestFilter;
  maskTexture.magFilter = NearestFilter;
  return { mask, maskTexture };
}

export function createStrands(threads: number, posterAspect: number, width: number): Strands {
  const data = new Float32Array(threads * ROWS * 4);
  /* The fourth channel holds each thread's ink, the same on every row. */
  for (let offset = 0; offset < data.length; offset += 4) {
    data[offset + 3] = inkOf((offset / 4) % threads, threads);
  }
  const texture = new DataTexture(data, threads, ROWS, RGBAFormat, FloatType);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  return {
    threads: Array.from({ length: threads }, (_, index) => threadAt(index, threads, posterAspect)),
    data,
    texture,
    ...createMask(),
    reach: width * 1.25 * 5 + 0.0035 + 0.002,
    posterAspect,
  };
}
