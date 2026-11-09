import type { Point } from "./brush-path.ts";

/* The method wheel (the client's artifact, 26/10): a wide circle whose rightmost point is the current dot,
   beside the step it names. An ink stroke comes down the arc from the top of the screen to the dot; then
   the dots move along the arc from one step to the next. Angles are in degrees, 0 at the dot, negative
   above it. */

export interface WheelGeometry {
  radius: number;
  centreX: number;
  centreY: number;
}

interface WheelFrame {
  /* Height of the pinned stage. */
  height: number;
  /* Distance of the resting dot from the stage's left edge. */
  dotX: number;
}

const MIN_RADIUS = 560;
const RADIUS_SHARE = 0.78;
const CENTRE_SHARE = 0.505;
/* The stroke enters from just above the screen, never from higher than 72° above the dot. */
const ENTRY_ABOVE_PX = 24;
const HIGHEST_ENTRY = -72;
/* Share of the scroll over which the first dot comes down; share of each step's course the dot holds at
   either end; how far along its way the dot is when the next step takes the name (it is landing). */
export const INTRO = 0.22;
const HOLD = 0.12;
const LANDING = 0.85;
/* How far down the first dot has come when Immersion is named: it is settling on its place. */
const FIRST_LANDING = 0.97;
const BRUSH_SAMPLES = 90;

export function wheelGeometry({ height, dotX }: WheelFrame): WheelGeometry {
  const radius = Math.max(MIN_RADIUS, height * RADIUS_SHARE);
  return { radius, centreX: dotX - radius, centreY: height * CENTRE_SHARE };
}

export function wheelPoint(
  { radius, centreX, centreY }: WheelGeometry,
  degrees: number,
): { x: number; y: number } {
  const angle = (degrees * Math.PI) / 180;
  return { x: centreX + radius * Math.cos(angle), y: centreY + radius * Math.sin(angle) };
}

/* Where the arc leaves the top of the screen. */
export function entryAngle({ radius, centreY }: WheelGeometry): number {
  const sine = Math.max(-1, (-ENTRY_ABOVE_PX - centreY) / radius);
  return Math.max(HIGHEST_ENTRY, (Math.asin(sine) * 180) / Math.PI);
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/* Starts and ends with no speed and no jolt: the dot eases out of a step and lands softly on the next. */
function smootherStep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export interface WheelCourse {
  /* How far the first dot has come down from the top (0 to 1). */
  entry: number;
  /* Steps travelled since the first one (0 to steps − 1). */
  travel: number;
  /* The step the dot rests on, or is landing on; −1 while the first dot is still coming down. */
  active: number;
}

/* Where the wheel stands at a share of the scroll: the first dot comes down (no step is named yet), then
   each step holds the dot
   a moment, the dot eases on to the next one and lands there, and only then the next step is named. */
export function wheelCourse(progress: number, steps: number): WheelCourse {
  const entry = easeInOutCubic(clamp(progress / INTRO));
  const course = clamp((progress - INTRO) / (1 - INTRO)) * (steps - 1);
  const step = Math.min(Math.floor(course), steps - 2);
  const moved = smootherStep(clamp((course - step - HOLD) / (1 - 2 * HOLD)));
  if (entry < FIRST_LANDING) {
    return { entry, travel: 0, active: -1 };
  }
  return { entry, travel: step + moved, active: step + (moved >= LANDING ? 1 : 0) };
}

/* The centre line of the ink stroke along the arc, from `from` down to `to` degrees: the line a sumi brush
   follows (`paintBrushStroke`), sampled at even steps. */
export function arcPoints(geometry: WheelGeometry, from: number, to: number): Point[] {
  return Array.from({ length: BRUSH_SAMPLES + 1 }, (_, sample) => {
    const { x, y } = wheelPoint(geometry, from + ((to - from) * sample) / BRUSH_SAMPLES);
    return [x, y] as const;
  });
}
