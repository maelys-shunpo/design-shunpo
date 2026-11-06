import { BUCKETS, kumihimoLook, ROWS, type Strands, type Thread } from "./fil-kumihimo-strands.ts";

/* What a frame needs to lay the threads: the pointer runs from −1 to 1 over the canvas, the rest is in poster
   units (the poster's height is 1). */
export interface Weave {
  time: number;
  progress: number;
  pull: number;
  pointer: { x: number; y: number };
  resolution: { x: number; y: number };
  posterAspect: number;
}

interface Layout {
  time: number;
  cord: number;
  spread: number;
  comb: number;
  braid: number;
  pull: number;
  handX: number;
  handY: number;
}

interface Strand {
  x: number;
  slope: number;
  depth: number;
}

const { braidPoint, combedWidth, cordRadius, fanWidth } = kumihimoLook;
const TWIST = 34;

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/* The cord hangs at cordX of the visible width on landscape screens and in the middle of a phone's; the comb and
   the fan narrow with the window. The pointer is mapped onto the poster the way object-fit: cover crops it. */
export function layoutOf(weave: Weave): Layout {
  const { resolution, posterAspect: aspect, pointer } = weave;
  const canvasAspect = resolution.x / Math.max(resolution.y, 1);
  const wide = canvasAspect > aspect;
  const visible = Math.min(1, canvasAspect / aspect);
  const placed = 0.5 + (kumihimoLook.cordX - 0.5) * smoothstep(0.7, 1.3, canvasAspect);
  return {
    time: weave.time,
    cord: (0.5 + (placed - 0.5) * visible) * aspect,
    spread: Math.min(Math.max(canvasAspect / 1.4, 0.55), 1),
    comb: smoothstep(0.12, 0.44, weave.progress),
    braid: smoothstep(0.56, 0.88, weave.progress),
    pull: weave.pull,
    handX: (pointer.x * 0.5 * (wide ? 1 : visible) + 0.5) * aspect,
    handY: pointer.y * 0.5 * (wide ? aspect / canvasAspect : 1) + 0.5,
  };
}

function tangled(thread: Thread, y: number, time: number): Strand {
  const p1 = thread.p1 + time * 0.11;
  const p2 = thread.p2 - time * 0.17;
  const first = thread.w1 * y + p1;
  const second = thread.w2 * y + p2;
  return {
    x:
      thread.base +
      thread.tilt * (y - 0.5) +
      thread.a1 * Math.sin(first) +
      thread.a2 * Math.sin(second),
    slope:
      thread.tilt +
      thread.a1 * thread.w1 * Math.cos(first) +
      thread.a2 * thread.w2 * Math.cos(second),
    depth: Math.sin(thread.w1 * 1.3 * y + p2 + thread.index),
  };
}

function combed(thread: Thread, y: number, layout: Layout): Strand {
  const swayAngle = y * 2.6 + layout.time * 0.35;
  const flutterAngle = y * 11 + thread.index * 1.7 + layout.time * 0.9;
  return {
    x:
      layout.cord +
      (thread.share - 0.5) * combedWidth * layout.spread +
      0.035 * Math.sin(swayAngle) * layout.spread +
      0.004 * Math.sin(flutterAngle),
    slope: 0.091 * layout.spread * Math.cos(swayAngle) + 0.044 * Math.cos(flutterAngle),
    depth: thread.rest,
  };
}

function braided(thread: Thread, y: number, layout: Layout): Strand {
  const angle = thread.turn * (y * TWIST + layout.time * 0.9) + thread.phase;
  const fan = clamp01((y - braidPoint) / (1 - braidPoint));
  const reach = (thread.share - 0.5) * fanWidth * layout.spread;
  const fanning = y > braidPoint ? reach / (1 - braidPoint) : 0;
  return {
    x: layout.cord + reach * fan + cordRadius * (1 - fan) * Math.sin(angle),
    slope: fanning + cordRadius * (1 - fan) * thread.turn * TWIST * Math.cos(angle),
    depth: Math.cos(angle) + (thread.rest - Math.cos(angle)) * fan,
  };
}

function mix(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

/* One thread at one height: the three states blended by the progress (a small stagger per thread), then plucked by
   the hand. The same arithmetic the shader ran per pixel, now run once per row. */
function strandAt(thread: Thread, y: number, layout: Layout): Strand {
  const comb = clamp01(layout.comb + thread.stagger * layout.comb * (1 - layout.comb) * 4);
  const braid = clamp01(layout.braid + thread.stagger * layout.braid * (1 - layout.braid) * 4);
  const loose = tangled(thread, y, layout.time);
  const parallel = combed(thread, y, layout);
  const cord = braided(thread, y, layout);
  const x = mix(mix(loose.x, parallel.x, comb), cord.x, braid);
  const lean = x - layout.handX;
  const reach = Math.exp(-((y - layout.handY) ** 2) / 0.03) * Math.exp(-(lean * lean) / 0.012);
  return {
    x: x + Math.sign(lean) * 0.07 * layout.pull * reach,
    slope: mix(mix(loose.slope, parallel.slope, comb), cord.slope, braid),
    depth: mix(mix(loose.depth, parallel.depth, comb), cord.depth, braid) + thread.lift,
  };
}

/* Flags, on one row, the columns a thread can touch between this row and the next (the shader blends the two). */
function flagReach(strands: Strands, thread: Thread, row: number): void {
  const { data, mask, reach, posterAspect, threads } = strands;
  const here = data[(row * threads.length + thread.index) * 4] ?? 0;
  const next = data[(Math.min(row + 1, ROWS - 1) * threads.length + thread.index) * 4] ?? here;
  const toColumn = BUCKETS / posterAspect;
  const first = Math.max(0, Math.floor((Math.min(here, next) - reach) * toColumn));
  const last = Math.min(BUCKETS - 1, Math.floor((Math.max(here, next) + reach) * toColumn));
  const word = thread.index < 32 ? 0 : 1;
  const bit = (1 << (thread.index % 32)) >>> 0;
  const flags = mask;
  for (let column = first; column <= last; column += 1) {
    const offset = (row * BUCKETS + column) * 2 + word;
    flags[offset] = ((flags[offset] ?? 0) | bit) >>> 0;
  }
}

/* Lays every thread on every row of the strand table, flags the columns each can touch, and marks both textures
   for upload. */
export function weaveStrands(strands: Strands, weave: Weave): void {
  const layout = layoutOf(weave);
  const { threads, data, mask } = strands;
  const table = data;
  for (const thread of threads) {
    for (let row = 0; row < ROWS; row += 1) {
      const strand = strandAt(thread, row / (ROWS - 1), layout);
      const offset = (row * threads.length + thread.index) * 4;
      table[offset] = strand.x;
      table[offset + 1] = strand.slope;
      table[offset + 2] = strand.depth;
    }
  }
  mask.fill(0);
  for (const thread of threads) {
    for (let row = 0; row < ROWS; row += 1) {
      flagReach(strands, thread, row);
    }
  }
  Object.assign(strands.texture, { needsUpdate: true });
  Object.assign(strands.maskTexture, { needsUpdate: true });
}
