import type { Point } from "./brush-path.ts";
import { arcPoints, entryAngle, type WheelGeometry, wheelPoint } from "./wheel-geometry.ts";

/* The method's one brush stroke: down the wheel's arc from the top of the screen to the rest point beside the copy,
   then on down the page in a supple line, one drop a step. The page follows its tip, so the line below the rest point
   is what the scroll brings up to it. Lengths are in pixels of the stage. */

export interface WheelTrail {
  /* The brush's centre line: the arc from where it enters the screen to the rest point, then the line on down past
     the last drop. */
  points: Point[];
  /* One drop a phase: the first on the rest point, each next one a pitch lower. */
  drops: Array<{ x: number; y: number }>;
  /* Distance along `points` to each drop. */
  marks: number[];
  /* Length of `points`. */
  length: number;
}

/* How far the line leans away from the copy between two drops; the drops themselves sit on the rest point's vertical,
   where the line runs straight down, as the arc does on arriving there. */
const SWAY_PX = 22;
/* The line runs on below the last drop by this share of a step: there the brush runs dry. */
const TAIL_SHARE = 0.35;
/* Room between two copies, beyond the tallest one; and the shortest step, as a share of the stage. */
const PITCH_GAP_PX = 96;
const PITCH_STAGE_SHARE = 0.5;
const SAMPLE_PX = 8;

/* The distance between two phases: never less than the tallest copy and its gap, so two copies never overlap. */
export function stepPitch(copyBlock: number, stageHeight: number): number {
  return Math.max(copyBlock + PITCH_GAP_PX, stageHeight * PITCH_STAGE_SHARE);
}

/* Depths below the rest point to sample: an even step, plus every drop and the end exactly. */
function depths(pitch: number, phases: number): number[] {
  const end = (phases - 1 + TAIL_SHARE) * pitch;
  const even = Array.from(
    { length: Math.floor(end / SAMPLE_PX) },
    (_, index) => (index + 1) * SAMPLE_PX,
  );
  const drops = Array.from({ length: phases - 1 }, (_, index) => (index + 1) * pitch);
  return [...new Set([...even, ...drops, end])].toSorted((first, second) => first - second);
}

function travelled(points: readonly Point[]): number[] {
  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    const [x, y] = points[index] ?? [0, 0];
    const [previousX, previousY] = points[index - 1] ?? [0, 0];
    distances.push((distances.at(-1) ?? 0) + Math.hypot(x - previousX, y - previousY));
  }
  return distances;
}

export function wheelTrail(
  geometry: WheelGeometry,
  { phases, pitch }: { phases: number; pitch: number },
): WheelTrail {
  const rest = wheelPoint(geometry, 0);
  const arc = arcPoints(geometry, entryAngle(geometry), 0);
  const line = depths(pitch, phases).map((depth): Point => [
    rest.x - SWAY_PX * Math.sin((Math.PI * depth) / pitch) ** 2,
    rest.y + depth,
  ]);
  const points = [...arc, ...line];
  const distances = travelled(points);
  const drops = Array.from({ length: phases }, (_, index) => ({
    x: rest.x,
    y: rest.y + index * pitch,
  }));
  const marks = drops.map(({ y }) => {
    const index = points.findIndex(
      ([, pointY], at) => at >= arc.length - 1 && Math.abs(pointY - y) < 1e-6,
    );
    return distances[index] ?? 0;
  });
  return { points, drops, marks, length: distances.at(-1) ?? 0 };
}

/* How far along the stroke the brush tip has come: down the arc as the stroke comes in (`entry`, 0 to 1), then from
   drop to drop as the phases go by (`travel`, 0 on the first drop, 1 on the second…). */
export function tipDistance(trail: WheelTrail, entry: number, travel: number): number {
  const first = trail.marks[0] ?? 0;
  if (entry < 1) {
    return first * Math.max(0, entry);
  }
  const last = trail.marks.length - 1;
  const step = Math.min(Math.max(0, Math.floor(travel)), last);
  const from = trail.marks[step] ?? 0;
  const to = trail.marks[Math.min(step + 1, last)] ?? from;
  return Math.min(from + (to - from) * (travel - step), trail.marks[last] ?? 0);
}
