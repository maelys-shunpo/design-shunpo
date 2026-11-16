import { hingeOf } from "./origami-flat.ts";
import type { FacetSpec, Flat } from "./origami-folds.ts";

/* The square sheet, cut along its creases into eight triangles around the centre: the two diagonals and the
   two middle lines of the preliminary base. Folded alternately along them, mountain then valley, the sheet
   gathers into a pleated star: the base most models are folded from. */
const RIM: readonly Flat[] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];
const CENTRE: Flat = [0, 0];
/* How far the base gathers: open enough to read as a star, closed enough to read as a base. */
const GATHER = Math.PI * 0.62;

function corner(index: number): Flat {
  return RIM[index % RIM.length] ?? CENTRE;
}

export const sheetPattern: FacetSpec[] = RIM.map((point, index): FacetSpec => {
  const triangle: Flat[] = [CENTRE, point, corner(index + 1)];
  if (index === 0) {
    return { id: "sheet-0", points: triangle };
  }
  return {
    id: `sheet-${index}`,
    parent: `sheet-${index - 1}`,
    points: triangle,
    hinge: hingeOf([CENTRE, point]),
    angle: GATHER,
    toward: index % 2 === 0 ? "up" : "down",
    window: [0.05 * index, 0.65 + 0.05 * index],
  };
});

/* The creases of the base, as drawn before folding: the diagonals are valleys, the middle lines mountains. */
export const sheetCreases = {
  valley: [corner(1), corner(5), corner(3), corner(7)],
  mountain: [corner(0), corner(4), corner(2), corner(6)],
} as const;

/* A Sonobe unit: a square body and two triangular tabs on opposite sides, a parallelogram once flat. Six of
   them lock into a cube, each tab tucked into the pocket of its neighbour. */
const HALF = 0.5;

export const unitPattern: FacetSpec[] = [
  {
    id: "body",
    points: [
      [-HALF, -HALF],
      [HALF, -HALF],
      [HALF, HALF],
      [-HALF, HALF],
    ],
  },
  ...([1, -1] as const).map((side): FacetSpec => ({
    id: side === 1 ? "tab-right" : "tab-left",
    parent: "body",
    points: [
      [HALF * side, -HALF * side],
      [HALF * side, HALF * side],
      [HALF * 1.7 * side, HALF * side],
    ],
    hinge: hingeOf([
      [HALF * side, -HALF * side],
      [HALF * side, HALF * side],
    ]),
    angle: (Math.PI / 2) * 1.08,
    toward: "down",
    window: [0.55, 1],
  })),
];
