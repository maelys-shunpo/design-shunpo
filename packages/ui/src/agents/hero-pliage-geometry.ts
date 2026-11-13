/* The geometry of « Pliage »: four square sheets, each folded into a kite, gathered into the SHUNPO star.

   Measured on the glyph's path (`STAR` in `brand/shuriken-paths.ts`, a 154.38 × 165.59 box): the star's centre,
   the distance from it to a sharp tip, the offset of an inner corner on both axes, and the radius of the hole.
   Each branch of the star is a kite (a tip, two inner corners and the centre, square at the centre), and that kite
   folds from a square exactly: two valley folds from one corner, each 16.5° off an edge, bring the edges inside
   the kite. So the four sheets close into the glyph itself, not a look-alike. */
const STAR_CENTRE = { x: 77.19, y: 82.81 };
const STAR_TIP = 60.62;
const STAR_INNER = 21.37;
const STAR_HOLE = 15.36;

/* The figure's own square, and the star drawn at its centre with a tip this far out. */
export const VIEW = 640;
export const CENTRE = VIEW / 2;
const TIP = 150;
const STAR_SCALE = TIP / STAR_TIP;
const INNER = (TIP * STAR_INNER) / STAR_TIP;

/* Draws a path of the glyph's box (`STAR`, `PEBBLE`) centred in the figure, at the star's scale. */
export const STAR_TRANSFORM = `translate(${String(CENTRE - STAR_CENTRE.x * STAR_SCALE)} ${String(CENTRE - STAR_CENTRE.y * STAR_SCALE)}) scale(${String(STAR_SCALE)})`;
export const HOLE = STAR_HOLE * STAR_SCALE;

export type Point = readonly [x: number, y: number];

function reflect(point: Point, from: Point, to: Point): Point {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const length = Math.hypot(dx, dy);
  const [ux, uy] = [dx / length, dy / length];
  const along = (point[0] - from[0]) * ux + (point[1] - from[1]) * uy;
  const [px, py] = [from[0] + along * ux, from[1] + along * uy];
  return [2 * px - point[0], 2 * py - point[1]];
}

/* One sheet in its own frame: the corner that becomes the centre of the star at the origin, the opposite corner
   (the tip) straight up. The creases run from the tip to the inner corners of the kite, on the sheet's edges. */
const tip: Point = [0, -TIP];
const corner: Point = [TIP / 2, -TIP / 2];
const creaseRight: Point = [INNER, -INNER];
const creaseLeft: Point = [-INNER, -INNER];

export const SHEET = {
  tip,
  centre: [0, 0] as Point,
  corner,
  otherCorner: [-TIP / 2, -TIP / 2] as Point,
  creaseRight,
  creaseLeft,
  /* Where the right flap's corner lands once folded over its crease. */
  folded: reflect(corner, tip, creaseRight),
  side: TIP / Math.SQRT2,
} as const;

export const KITE: readonly Point[] = [
  SHEET.tip,
  SHEET.creaseRight,
  SHEET.centre,
  SHEET.creaseLeft,
];
export const RIGHT_FLAP: readonly Point[] = [SHEET.tip, SHEET.corner, SHEET.creaseRight];
export const LEFT_FLAP: readonly Point[] = [SHEET.tip, SHEET.otherCorner, SHEET.creaseLeft];

export function points(list: readonly Point[]): string {
  return list.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

/* A flap turning over its crease, seen from above: it shrinks across the crease to a line, then lies mirrored on
   the kite. `scale` runs from 1 (flat, open) to -1 (folded). */
export function foldValues(from: Point, to: Point, scale: number): number[] {
  const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
  const length = Math.hypot(dx, dy);
  const [nx, ny] = [-dy / length, dx / length];
  const shrink = scale - 1;
  const a = 1 + shrink * nx * nx;
  const b = shrink * nx * ny;
  const d = 1 + shrink * ny * ny;
  return [a, b, b, d, from[0] - (a * from[0] + b * from[1]), from[1] - (b * from[0] + d * from[1])];
}

export function foldMatrix(from: Point, to: Point, scale: number): string {
  return `matrix(${foldValues(from, to, scale)
    .map((value) => value.toFixed(4))
    .join(" ")})`;
}

/* Where a sheet sits: the centre of its square at (x, y), turned and scaled about it. */
export interface Placement {
  x: number;
  y: number;
  turn: number;
  scale: number;
}

export function placementTransform({ x, y, turn, scale }: Placement): string {
  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${turn.toFixed(2)}) scale(${scale.toFixed(4)}) translate(0 ${String(TIP / 2)})`;
}

/* The four branches clockwise from the top; the left one turns back a quarter rather than on three. */
const FINAL_TURNS = [0, 90, 180, -90] as const;

export function finalPlacement(index: number): Placement {
  const turn = FINAL_TURNS[index % FINAL_TURNS.length] ?? 0;
  const radians = (turn * Math.PI) / 180;
  const reach = TIP / 2;
  return {
    x: CENTRE + reach * Math.sin(radians),
    y: CENTRE - reach * Math.cos(radians),
    turn,
    scale: 1,
  };
}

/* Laid on the table before the fold, one in each corner near the branch it will become, set at a slant so the
   tool's name runs along its lower edge, larger than in the star. */
export const POSTER_PLACES: readonly Placement[] = [
  { x: 196, y: 150, turn: 37, scale: 1.4 },
  { x: 486, y: 208, turn: 57, scale: 1.18 },
  { x: 448, y: 478, turn: 33, scale: 1.46 },
  { x: 160, y: 440, turn: 51, scale: 1.24 },
];

/* Where each tool's name is printed under its sheet on the table. */
export function labelPoint(index: number): Point {
  const place = POSTER_PLACES[index] ?? { x: CENTRE, y: CENTRE, turn: 0, scale: 1 };
  const reach = (SHEET.side * place.scale * Math.SQRT2) / 2;
  return [place.x, place.y + reach + 22];
}
