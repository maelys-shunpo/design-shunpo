/* The question scene's course, in screens of scroll from the moment its stage pins (the client's artifact,
   « bascule courte », 28/10): the plates arrive around the question one every 0.14 screen, the shuriken
   cuts the night away over two thirds of a screen (a full screen held the reader on one gesture), the
   answer's lines rise as the last of the night goes, then a breath to read it before the page moves on. */
const PLATE_COUNT = 4;
const PLATE_STEP = 0.14;
const PLATE_LENGTH = 0.22;
const PLATE_ARRIVING_SCALE = 1.06;
/* A plate is opaque two thirds of the way into its arrival. */
const PLATE_OPACITY_RATE = 1.6;
const DIM = { start: 0.64, step: 0.025, length: 0.2, depth: 0.72 } as const;
const CUT = { start: 0.64, length: 0.65 } as const;
const ANSWER = { start: 1.19, step: 0.09, length: 0.12, reading: 0.35 } as const;

/* The shuriken grows from a point to 240 px (less on a phone) a third of the way, then on until it covers
   the screen: fast at first, a pause on the mark, then faster again. Scales are in 100 px. */
const SEED_SCALE = 0.04;
const MARK_AT = 0.35;
const MARK_SCALE = 2.4;
const MARK_SHARE_OF_SHORT_SIDE = 0.0038;
const START_SLOPE_BOOST = 1.5;
const END_SLOPE_BOOST = 1.6;
const SLOPE_LIMIT = 9;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

function easeInOut(progress: number): number {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

/* Screens the stage stays pinned for an answer of `lines` lines. */
export function courseLength(lines: number): number {
  return ANSWER.start + ANSWER.step * (lines - 1) + ANSWER.length + ANSWER.reading;
}

function arrival(screens: number, index: number): number {
  return clamp((screens - PLATE_STEP * index) / PLATE_LENGTH);
}

interface PlatePath {
  /* Unit vector from the plate's place towards the middle of the screen. */
  direction: readonly [number, number];
  /* How far beyond its place the plate starts, in px. */
  reach: number;
  /* How much closer to the question each later plate draws it, in px. */
  press: number;
}

export interface PlateFrame {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

/* Where plate `index` stands after `screens`: it arrives from beyond its place towards the question, is
   drawn a little closer by each plate after it, then dims while the shuriken cuts. */
export function plateFrame(
  screens: number,
  index: number,
  { direction, reach, press }: PlatePath,
): PlateFrame {
  const progress = arrival(screens, index);
  const far = reach * (1 - easeOut(progress));
  let drawn = 0;
  for (let later = index + 1; later < PLATE_COUNT; later += 1) {
    drawn += press * easeInOut(arrival(screens, later));
  }
  const dim = easeInOut(clamp((screens - (DIM.start + DIM.step * index)) / DIM.length));
  const [dx, dy] = direction;
  return {
    x: dx === 0 ? 0 : -dx * far,
    y: -dy * far + Math.sign(dy) * drawn,
    scale: PLATE_ARRIVING_SCALE - (PLATE_ARRIVING_SCALE - 1) * easeOut(progress),
    opacity: clamp(progress * PLATE_OPACITY_RATE) * (1 - dim * DIM.depth),
  };
}

/* How far the cut has gone, from 0 (night whole) to 1 (no night left). */
export function cutProgress(screens: number): number {
  return clamp((screens - CUT.start) / CUT.length);
}

interface Knot {
  x: number;
  y: number;
  slope: number;
}

/* The cubic Hermite segment between two knots. */
function hermite(from: Knot, to: Knot, x: number): number {
  const span = to.x - from.x;
  const t = (x - from.x) / span;
  return (
    (2 * t ** 3 - 3 * t ** 2 + 1) * from.y +
    (t ** 3 - 2 * t ** 2 + t) * span * from.slope +
    (-2 * t ** 3 + 3 * t ** 2) * to.y +
    (t ** 3 - t ** 2) * span * to.slope
  );
}

/* Shortens a segment's end slopes when they would overshoot (Fritsch-Carlson), keeping it monotone. */
function tamed(from: Knot, to: Knot): [Knot, Knot] {
  const delta = (to.y - from.y) / (to.x - from.x);
  const [a, b] = [from.slope / delta, to.slope / delta];
  const size = a * a + b * b;
  if (size <= SLOPE_LIMIT) {
    return [from, to];
  }
  const shrink = 3 / Math.sqrt(size);
  return [
    { ...from, slope: shrink * a * delta },
    { ...to, slope: shrink * b * delta },
  ];
}

interface Screen {
  width: number;
  height: number;
  /* The scale at which the turned shuriken covers the screen. */
  cover: number;
}

/* The shuriken's scale (1 = 100 px across) when the cut has gone `progress` of the way: a monotone cubic,
   in log scale, through the seed, the mark and the cover. */
export function cutScale(progress: number, { width, height, cover }: Screen): number {
  const mark = Math.min(MARK_SCALE, MARK_SHARE_OF_SHORT_SIDE * Math.min(width, height));
  const [y0, y1, y2] = [Math.log(SEED_SCALE), Math.log(mark), Math.log(cover)];
  const [before, after] = [(y1 - y0) / MARK_AT, (y2 - y1) / (1 - MARK_AT)];
  const middle = before * after <= 0 ? 0 : (before + after) / 2;
  const [seed, markFirst] = tamed(
    { x: 0, y: y0, slope: before * START_SLOPE_BOOST },
    { x: MARK_AT, y: y1, slope: middle },
  );
  const [markSecond, end] = tamed(markFirst, { x: 1, y: y2, slope: after * END_SLOPE_BOOST });
  const curve =
    progress <= MARK_AT ? hermite(seed, markSecond, progress) : hermite(markSecond, end, progress);
  return Math.exp(curve);
}

/* How far answer line `line` has risen after `screens`, from 0 (under its mask) to 1. */
export function answerRise(screens: number, line: number): number {
  return easeOut(clamp((screens - (ANSWER.start + ANSWER.step * line)) / ANSWER.length));
}
