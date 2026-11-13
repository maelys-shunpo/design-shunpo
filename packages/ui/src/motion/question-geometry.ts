/* The question scene's course, in screens of scroll from the moment its stage pins (the client's artifact,
   « bascule courte », 28/10, reordered and paced 12/11): the question, alone in the middle of the night, rises to the
   top of it, the plates rise into place under it one every 0.28 screen (12/11, Maëlys: the pains went by too fast), all four rest whole for 0.9 screen of reading,
   the shuriken cuts the night away over six tenths of a screen (a full screen held the reader on one gesture), the
   answer's lines rise as the last of the night goes, then a breath to read it before the page moves on. */
const PLATE_COUNT = 4;
const RISE = { start: 0, length: 0.22 } as const;
/* The first plate sets off before the question has quite reached the top, so the two read as one gesture. */
const PLATES_FROM = 0.14;
const PLATE_STEP = 0.28;
const PLATE_LENGTH = 0.22;
const PLATE_ARRIVING_SCALE = 1.06;
/* A plate is opaque two thirds of the way into its arrival. */
const PLATE_OPACITY_RATE = 1.6;
/* The last plate has settled; the four then rest whole long enough to be read before the cut. */
const SETTLED = PLATES_FROM + PLATE_STEP * (PLATE_COUNT - 1) + PLATE_LENGTH;
/* The four plates then rest whole long enough to be read (12/11, Maëlys: lengthened from 0.6 so four dense plates
   get air before the cut). */
const READING = 0.9;
const CUT = { start: SETTLED + READING, length: 0.6 } as const;
const DIM = { start: CUT.start, step: 0.025, length: 0.2, depth: 0.72 } as const;
/* The question dims a little less than its plates: it stays the subject while the shuriken cuts through it. */
const QUESTION_DIM_DEPTH = 0.7;
/* Screens of the hold in which the night arrives as a card around the question and grows to the screen, before the
   course starts. */
export const NIGHT_ENTER_SCREENS = 0.4;
/* The answer's first line sets off a tenth of a screen before the last of the night goes. */
const ANSWER = {
  start: CUT.start + CUT.length - 0.1,
  step: 0.09,
  length: 0.12,
  reading: 0.35,
} as const;

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

/* Screens into the course at which the last of an answer's `lines` lines has risen. */
function lastLineLanded(lines: number): number {
  return ANSWER.start + ANSWER.step * (lines - 1) + ANSWER.length;
}

/* Screens the course runs for an answer of `lines` lines, from the night's full screen to the reading breath. */
export function courseLength(lines: number): number {
  return lastLineLanded(lines) + ANSWER.reading;
}

/* Screens the stage stays held for an answer of `lines` lines: the night's entrance, then the course, and no longer,
   so the scroll never runs on over a finished scene. A full-screen arrival (`nightEnter` 0, the night already risen
   over the hero) drops the entrance and holds for the course alone. */
export function questionHold(lines: number, nightEnter = NIGHT_ENTER_SCREENS): number {
  return nightEnter + courseLength(lines);
}

/* How far the question has dimmed after `screens`, from 0 to `QUESTION_DIM_DEPTH`: it dims with the plates as the
   shuriken starts to cut, so the star lands on a quiet night rather than on the lit headline. */
export function questionDim(screens: number): number {
  return easeInOut(clamp((screens - DIM.start) / DIM.length)) * QUESTION_DIM_DEPTH;
}

/* How far the question has risen from the middle of the night to its place at the top, from 0 to 1. */
export function questionRise(screens: number): number {
  return easeInOut(clamp((screens - RISE.start) / RISE.length));
}

function arrival(screens: number, index: number): number {
  return clamp((screens - PLATES_FROM - PLATE_STEP * index) / PLATE_LENGTH);
}

export interface PlateFrame {
  y: number;
  scale: number;
  opacity: number;
}

/* Where plate `index` stands after `screens`: it rises into its place under the question from `reach` px below,
   then dims while the shuriken cuts. */
export function plateFrame(screens: number, index: number, reach: number): PlateFrame {
  const progress = arrival(screens, index);
  const dim = easeInOut(clamp((screens - (DIM.start + DIM.step * index)) / DIM.length));
  return {
    y: reach * (1 - easeOut(progress)),
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

/* The plate the travelling frame designates. */
export interface Designated {
  index: number;
}

/* The travelling frame takes a plate once it is most of the way in (its title readable) and lets go for good a beat
   after the last one has landed, so the four are read as one group: the answer carries its own brackets, around its
   keyword. */
const DESIGNATE_PLATE_AFTER = 0.13;
/* The last plate keeps the frame as long as the others did. */
const RELEASE = PLATES_FROM + DESIGNATE_PLATE_AFTER + PLATE_STEP * PLATE_COUNT;

/* The plate the travelling frame designates after `screens`, or nothing before the first and from the release on. */
export function designatedAt(screens: number): Designated | undefined {
  if (screens >= RELEASE) {
    return undefined;
  }
  const index = Math.floor((screens - PLATES_FROM - DESIGNATE_PLATE_AFTER) / PLATE_STEP);
  if (index < 0) {
    return undefined;
  }
  return { index: Math.min(index, PLATE_COUNT - 1) };
}

/* The answer's keyword, as in the method's title: it comes into focus as its line lands, then the brackets close on it
   from outside, both done within the reading breath. In screens from the last line's landing. */
const INK_FOCUS = { from: -0.04, length: 0.12 } as const;
const INK_CLOSE = { from: 0.04, length: 0.12 } as const;

/* How far the keyword of an answer of `lines` lines has come into focus after `screens`, from 0 (blurred, unseen) to 1. */
export function inkWordFocus(screens: number, lines: number): number {
  return easeOut(clamp((screens - lastLineLanded(lines) - INK_FOCUS.from) / INK_FOCUS.length));
}

/* How far the keyword's brackets have closed on it after `screens`, from 0 (outside, unseen) to 1. */
export function inkWordClose(screens: number, lines: number): number {
  return easeInOut(clamp((screens - lastLineLanded(lines) - INK_CLOSE.from) / INK_CLOSE.length));
}
