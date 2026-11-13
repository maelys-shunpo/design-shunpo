/* The closing coupe's timeline, as fractions of the held scene: p is the progress object the scroll drives, from 0
   to 1. The values are those Maëlys validated in the brainstorm (cta-coupe-traverse-v4, 12 November 2026): the last
   questions hold on their paper, the SHUNPO shuriken crosses the whole page at a constant speed and leaves, a hairline
   holds for a beat, then the page gives, the two halves fall apart and the closing rises on the night underneath. */

/* Screens of scroll the stage is held for: the throw, the beat, the halves falling apart and the reveal. */
const HOLD_SCREENS = 2.8;

/* The star crosses between these two points of the timeline, off one edge to off the other. */
const THROW_START = 0.2;
const THROW_END = 0.31;

/* Three ghosts trail the star (the Shunpo Shift), each this much further back along the crossing. */
export const GHOST_COUNT = 3;
const GHOST_GAP = 0.08;

/* The hairline left behind holds through the beat, then fades over this span. */
const SLIT_FADE_START = 0.38;
const SLIT_FADE_END = 0.42;

/* The upper half slides down along the cut first, then the two halves fall apart. */
const SLIDE_START = 0.37;
const SLIDE_END = 0.46;
const PART_START = 0.44;
const PART_END = 0.78;

/* The impact tremble starts as the page gives and decays within a tenth of the scroll. */
const KNOCK_AT = 0.37;
const KNOCK_DECAY = 24;
const KNOCK_FREQUENCY = 130;

/* The title rises as the halves part; the button arrives last, the one red once the star has gone. */
export const TITLE_REVEAL = { start: 0.5, end: 0.82 } as const;
export const BUTTON_REVEAL = { start: 0.74, end: 0.94 } as const;

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
