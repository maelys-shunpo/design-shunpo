/* Geometry under a brush stroke: a seeded random source, a smooth centre line sampled at even steps,
   and SVG path data. Everything is in viewBox units and deterministic for a given seed. */

export type Point = readonly [number, number];

export type Random = () => number;

export interface StrokeFrame {
  points: Point[];
  tangents: Point[];
  normals: Point[];
}

const SPLINE_STEPS = 12;

/* Mulberry32: tiny, fast and identical on every JavaScript engine. */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function smoothStep(from: number, to: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/* The entry of a per-point list at an index, clamped to the ends of the list. */
function clampedAt<Entry>(entries: readonly Entry[], index: number): Entry {
  const entry = entries[Math.min(entries.length - 1, Math.max(0, index))];
  if (entry === undefined) {
    throw new Error("A brush stroke needs at least one point.");
  }
  return entry;
}

export function pointAt(points: readonly Point[], index: number): Point {
  return clampedAt(points, index);
}

function catmullRom(values: readonly [number, number, number, number], t: number): number {
  const [before, from, to, after] = values;
  const squared = t * t;
  return (
    0.5 *
    (2 * from +
      (to - before) * t +
      (2 * before - 5 * from + 4 * to - after) * squared +
      (3 * from - before - 3 * to + after) * squared * t)
  );
}

function spline(points: readonly Point[]): Point[] {
  const curve: Point[] = [];
  for (let segment = 0; segment < points.length - 1; segment += 1) {
    const before = pointAt(points, segment - 1);
    const from = pointAt(points, segment);
    const to = pointAt(points, segment + 1);
    const after = pointAt(points, segment + 2);
    for (let step = 0; step < SPLINE_STEPS; step += 1) {
      const t = step / SPLINE_STEPS;
      curve.push([
        catmullRom([before[0], from[0], to[0], after[0]], t),
        catmullRom([before[1], from[1], to[1], after[1]], t),
      ]);
    }
  }
  curve.push(pointAt(points, points.length - 1));
  return curve;
}

function distances(points: readonly Point[]): number[] {
  const travelled = [0];
  for (let index = 1; index < points.length; index += 1) {
    const [x, y] = pointAt(points, index);
    const [previousX, previousY] = pointAt(points, index - 1);
    travelled.push(clampedAt(travelled, index - 1) + Math.hypot(x - previousX, y - previousY));
  }
  return travelled;
}

/* Samples a polyline at even distances, so the brush moves at a steady pace along it. */
function resample(points: readonly Point[], count: number): Point[] {
  const travelled = distances(points);
  const total = clampedAt(travelled, travelled.length - 1);
  const samples: Point[] = [];
  let segment = 0;
  for (let sample = 0; sample < count; sample += 1) {
    const target = (total * sample) / (count - 1);
    while (segment < travelled.length - 2 && clampedAt(travelled, segment + 1) < target) {
      segment += 1;
    }
    const start = clampedAt(travelled, segment);
    const share = (target - start) / (clampedAt(travelled, segment + 1) - start || 1);
    const [x, y] = pointAt(points, segment);
    const [nextX, nextY] = pointAt(points, segment + 1);
    samples.push([x + (nextX - x) * share, y + (nextY - y) * share]);
  }
  return samples;
}

function tangentAt(points: readonly Point[], index: number): Point {
  const [x, y] = pointAt(points, index + 1);
  const [previousX, previousY] = pointAt(points, index - 1);
  const length = Math.hypot(x - previousX, y - previousY) || 1;
  return [(x - previousX) / length, (y - previousY) / length];
}

/* The centre line of a stroke through its control points, with its direction and normal at each sample. */
export function strokeFrame(points: readonly Point[], samples: number): StrokeFrame {
  const line = resample(spline(points), samples);
  const tangents = line.map((_, index) => tangentAt(line, index));
  return {
    points: line,
    tangents,
    normals: tangents.map(([x, y]): Point => [-y, x]),
  };
}

export function offsetPoint(point: Point, direction: Point, distance: number): Point {
  return [point[0] + direction[0] * distance, point[1] + direction[1] * distance];
}

function format(value: number): string {
  return String(Math.round(value * 10) / 10);
}

export function linePath(points: readonly Point[]): string {
  return points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${format(x)} ${format(y)}`)
    .join("");
}

export function shapePath(points: readonly Point[]): string {
  return `${linePath(points)}Z`;
}

/* Dash lengths as a percentage of a path whose `pathLength` is 100. */
export function dashPattern(lengths: readonly number[]): string {
  return lengths.map((length) => format(length * 100)).join(" ");
}
