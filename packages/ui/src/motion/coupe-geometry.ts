/* The closing coupe's timeline, as fractions of the held scene: p is the progress object the scroll drives, from 0
   to 1. The gesture is the one Maëlys validated in the brainstorm (cta-coupe-traverse-v4, 12 November 2026): the
   SHUNPO shuriken crosses the whole page at a constant speed and leaves, a hairline holds for a beat, then the page
   gives, the two halves fall apart and the closing rises on the night underneath. Each moment is set in screens of
   scroll since the stage was held, so its pace stays the same whatever the hold. The star is thrown as soon as the
   stage is held: the questions' paper has just scrolled by, so a held stretch of bare paper first reads as empty. */

/* Screens of scroll the stage is held for: the throw, the beat, the halves falling apart and the reveal. */
const HOLD_SCREENS = 2.3;

/* A moment of the hold, in screens since the stage was held, as a fraction of the timeline. */
function at(screens: number): number {
  return screens / HOLD_SCREENS;
}

/* The star crosses between these two points of the timeline, off one edge to off the other. */
const THROW_START = at(0.06);
const THROW_END = at(0.37);

/* Three ghosts trail the star (the Shunpo Shift), each this much further back along the crossing. */
export const GHOST_COUNT = 3;
const GHOST_GAP = 0.08;

/* The hairline left behind holds through the beat, then fades over this span. */
const SLIT_FADE_START = at(0.564);
const SLIT_FADE_END = at(0.676);

/* The upper half slides down along the cut first, then the two halves fall apart. */
const SLIDE_START = at(0.536);
const SLIDE_END = at(0.788);
const PART_START = at(0.732);
const PART_END = at(1.684);

/* The impact tremble starts as the page gives and decays within about a third of a screen, at a set pace per screen. */
const KNOCK_AT = SLIDE_START;
const KNOCK_DECAY = 8.6 * HOLD_SCREENS;
const KNOCK_FREQUENCY = 46.4 * HOLD_SCREENS;

/* The title rises as the halves part; the button arrives last, the one red once the star has gone, a breath before
   the hold lets go. */
export const TITLE_REVEAL = { start: at(0.9), end: at(1.796) } as const;
export const BUTTON_REVEAL = { start: at(1.572), end: at(2.132) } as const;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function segment(value: number, from: number, to: number): number {
  return clamp01((value - from) / (to - from));
}

function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

function easeIn(progress: number): number {
  return progress ** 3;
}

/* Screens the stage stays held for, so the scroll never runs on over a finished scene. */
export function coupeHold(): number {
  return HOLD_SCREENS;
}

/* The questions' paper has just arrived, so the stage dwells on it before the gesture, giving the visitor time to
   read the FAQ. These screens of scroll pass with the gesture held at zero. Tuned in motion-review. */
export const READING_SCREENS = 1;

/* Screens the whole scene stays held for: the reading dwell first, then the gesture's own hold. */
export function sceneHold(): number {
  return READING_SCREENS + coupeHold();
}

/* Where in the held scene the reading dwell ends and the gesture begins, as a fraction of the scene. */
export function readingFraction(): number {
  return READING_SCREENS / sceneHold();
}

/* The gesture's progress from the scene's progress: held at zero across the reading dwell, then the rest of the
   scroll mapped linearly onto the gesture's full [0, 1]. */
export function gestureProgress(sceneProgress: number): number {
  return segment(sceneProgress, readingFraction(), 1);
}

/* How far the star is along its crossing, unclamped: below 0 before it enters, above 1 once it has left. */
export function throwRaw(p: number): number {
  return (p - THROW_START) / (THROW_END - THROW_START);
}

/* The star is on the page only between its edges. */
export function throwVisible(p: number): boolean {
  const raw = throwRaw(p);
  return raw > 0 && raw < 1;
}

/* Where the star sits on its path, from one edge (0) to the other (1), once it is visible. */
export function throwPosition(p: number): number {
  return clamp01(throwRaw(p));
}

/* How far ghost `index` is along the crossing, a step behind the star. */
export function ghostRaw(p: number, index: number): number {
  return throwRaw(p) - (index + 1) * GHOST_GAP;
}

/* A ghost shows only while the star is still in flight and the ghost itself has entered the page. */
export function ghostVisible(p: number, index: number): boolean {
  return throwVisible(p) && ghostRaw(p, index) > 0;
}

/* How solid the hairline is: absent before the throw, full through the beat, then gone. */
export function slitOpacity(p: number): number {
  if (throwRaw(p) <= 0) {
    return 0;
  }
  return 1 - segment(p, SLIT_FADE_START, SLIT_FADE_END);
}

/* How far the upper half has slid down the cut, from 0 to 1. */
export function slideAt(p: number): number {
  return easeOut(segment(p, SLIDE_START, SLIDE_END));
}

/* How far the two halves have fallen apart, from 0 (closed) to 1 (fully open, the night uncovered). */
export function partAt(p: number): number {
  return easeIn(segment(p, PART_START, PART_END));
}

/* The impact tremble, a decaying oscillation in [-1, 1] as a share of the shake amplitude: still until the page gives. */
export function shake(p: number): number {
  const since = p - KNOCK_AT;
  if (since <= 0) {
    return 0;
  }
  return Math.exp(-since * KNOCK_DECAY) * Math.sin(since * KNOCK_FREQUENCY);
}
