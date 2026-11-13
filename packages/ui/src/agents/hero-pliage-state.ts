import {
  CENTRE,
  finalPlacement,
  foldMatrix,
  type Placement,
  POSTER_PLACES,
  placementTransform,
  SHEET,
  STAR_TRANSFORM,
} from "./hero-pliage-geometry.ts";

/* One sheet at a moment of the scene: where it sits, how far each flap has folded (0 open, 1 folded), how much of
   its tool's name is left on the table, and how high it is lifted off the table while it flies (0 to 1). */
export interface SheetState extends Placement {
  right: number;
  left: number;
  label: number;
  lift: number;
}

/* The rest of the figure: the pebble sliding under the star, the hole punched through it, the star's turn. */
export interface SignState {
  pebble: number;
  hole: number;
  turn: number;
}

/* The pebble slides in from the right of the frame, opaque from its first frame. */
const PEBBLE_TRAVEL = 400;
/* The light that rakes a flap as it passes its edge, and the shade on its back as it comes down. */
const FOLD_LIGHT = 0.5;
const FOLD_SHADE = 0.22;
/* The shadow a standing flap casts on the kite, and the half-tone that marks the folded branch's ridge. */
const FLAP_SHADOW = 0.14;
const RIDGE_SHADE = 0.07;
/* A lifted sheet rises toward the visitor and its shadow comes loose: how far, at the top of the lift. */
const LIFT_SCALE = 0.05;
const LIFT_SHADOW = { x: 8, y: 18, opacity: 0.16 };
/* The tool's mark: printed on the kite's axis between the folded corners, and how dark. */
const MARK = { y: -0.37 * SHEET.side * Math.SQRT2, size: 22, ink: 0.7 };
/* The instant step at the end of the scene: a quarter turn. */
export const FINAL_TURN = 90;

const FALLBACK_PLACE: Placement = { x: CENTRE, y: CENTRE, turn: 0, scale: 1 };

export function posterSheet(index: number): SheetState {
  const place = POSTER_PLACES[index] ?? FALLBACK_PLACE;
  return { ...place, right: 0, left: 0, label: 1, lift: 0 };
}

export function foldedSheet(index: number): SheetState {
  return { ...finalPlacement(index), right: 1, left: 1, label: 0, lift: 0 };
}

export const POSTER_SIGN: SignState = { pebble: 0, hole: 0, turn: 0 };
export const FINAL_SIGN: SignState = { pebble: 1, hole: 1, turn: FINAL_TURN };

/* An opacity as an attribute: three decimals, and whole values written whole ("1", not "1.000"). */
function share(value: number): string {
  return String(Number(value.toFixed(3)));
}

export interface FlapAttributes {
  transform: string;
  light: string;
  shade: string;
  cast: string;
}

/* A flap seen from above while it turns: it narrows to its crease, catches the light on its edge, then lies
   mirrored on the kite, shaded as it comes down, casting its shadow on the paper while it stands. */
function flapAttributes(progress: number, crease: typeof SHEET.creaseRight): FlapAttributes {
  const scale = Math.cos(Math.PI * progress);
  return {
    transform: foldMatrix(SHEET.tip, crease, scale),
    light: share(scale > 0 ? FOLD_LIGHT * (1 - scale) : 0),
    shade: share(scale < 0 ? FOLD_SHADE * (1 + scale) : 0),
    cast: share(FLAP_SHADOW * Math.sin(Math.PI * progress)),
  };
}

export interface SheetAttributes {
  transform: string;
  right: FlapAttributes;
  left: FlapAttributes;
  rightCrease: string;
  leftCrease: string;
  axis: string;
  ridge: string;
  label: string;
  mark: string;
  liftShadow: { transform: string; opacity: string };
}

/* The mark stays upright on screen whatever the sheet's and the star's turn, so the tools read on every branch
   and visibly travel with the star when it turns. */
function markTransform(turn: number): string {
  const half = MARK.size / 2;
  return `translate(0 ${MARK.y.toFixed(2)}) rotate(${(-turn).toFixed(2)}) translate(${String(-half)} ${String(-half)}) scale(${String(MARK.size / 24)})`;
}

export const MARK_INK = String(MARK.ink);

export function sheetAttributes(state: SheetState, starTurn: number): SheetAttributes {
  const folded = Math.min(state.right, state.left);
  return {
    transform: placementTransform({ ...state, scale: state.scale * (1 + LIFT_SCALE * state.lift) }),
    right: flapAttributes(state.right, SHEET.creaseRight),
    left: flapAttributes(state.left, SHEET.creaseLeft),
    rightCrease: share(1 - state.right),
    leftCrease: share(1 - state.left),
    axis: share(1 - folded),
    ridge: share(RIDGE_SHADE * folded),
    label: share(state.label),
    mark: markTransform(state.turn + starTurn),
    liftShadow: {
      transform: `translate(${(LIFT_SHADOW.x * state.lift).toFixed(2)} ${(LIFT_SHADOW.y * state.lift).toFixed(2)})`,
      opacity: share(LIFT_SHADOW.opacity * state.lift),
    },
  };
}

export interface SignAttributes {
  pebble: { transform: string; opacity: string };
  pebbleShape: string;
  hole: string;
  star: string;
}

export function signAttributes(state: SignState): SignAttributes {
  return {
    pebble: {
      transform: `translate(${((1 - state.pebble) * PEBBLE_TRAVEL).toFixed(2)} 0)`,
      opacity: state.pebble > 0 ? "1" : "0",
    },
    pebbleShape: STAR_TRANSFORM,
    hole: `translate(${String(CENTRE)} ${String(CENTRE)}) scale(${state.hole.toFixed(4)})`,
    star: `rotate(${state.turn.toFixed(2)} ${String(CENTRE)} ${String(CENTRE)})`,
  };
}
