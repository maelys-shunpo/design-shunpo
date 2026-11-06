import { HALF_PI, hingeOf, mirrorY, OVER, turnQuarter } from "./origami-flat.ts";
import type { FacetSpec, Flat } from "./origami-folds.ts";

/* The masu box: a square base, four walls raised, their top bands folded inside, the corner gussets tucked in. */
const BASE = 0.4;
const WALL = 0.72;
const RIM = 0.84;

function quarterOf(points: readonly Flat[], quarter: number): Flat[] {
  return points.map((point) => turnQuarter(point, quarter));
}

/* An upright band of the sheet, from y = from to y = to across the base's width. */
function band(from: number, to: number): Flat[] {
  return [
    [-BASE, from],
    [BASE, from],
    [BASE, to],
    [-BASE, to],
  ];
}

function masuSide(quarter: number): FacetSpec[] {
  const delay = quarter * 0.06;
  const gusset: Flat[] = [
    [BASE, BASE],
    [BASE, WALL],
    [WALL, BASE],
  ];
  return [
    {
      id: `wall-${quarter}`,
      parent: "base",
      points: quarterOf(band(BASE, WALL), quarter),
      hinge: hingeOf(quarterOf(band(BASE, WALL), quarter)),
      angle: HALF_PI,
      toward: "up",
      window: [0.08 + delay, 0.5 + delay],
    },
    {
      id: `rim-${quarter}`,
      parent: `wall-${quarter}`,
      points: quarterOf(band(WALL, RIM), quarter),
      hinge: hingeOf(quarterOf(band(WALL, RIM), quarter)),
      angle: OVER,
      toward: "up",
      window: [0.66, 0.96],
    },
    {
      id: `gusset-${quarter}`,
      parent: `wall-${quarter}`,
      points: quarterOf(gusset, quarter),
      hinge: hingeOf(quarterOf(gusset, quarter)),
      angle: HALF_PI * 0.96,
      toward: "up",
      window: [0.42 + delay * 0.5, 0.74 + delay * 0.5],
    },
  ];
}

export const masuPattern: FacetSpec[] = [
  {
    id: "base",
    points: [
      [-BASE, -BASE],
      [BASE, -BASE],
      [BASE, BASE],
      [-BASE, BASE],
    ],
  },
  ...[0, 1, 2, 3].flatMap((quarter) => masuSide(quarter)),
];

/* The paper boat: a flat keel, two hulls raised, bow and stern closed, and the two sails folded in to meet
   above the keel in the classic peak. Bow toward +x. */
const HULL: Flat[] = [
  [-0.7, 0.08],
  [0.7, 0.08],
  [1, 0.5],
  [-1, 0.5],
];
const SAIL: Flat[] = [
  [-0.55, 0.5],
  [0.55, 0.5],
  [0, 1.1],
];

function boatSide(side: 1 | -1): FacetSpec[] {
  const face = side === 1 ? (points: Flat[]) => points : mirrorY;
  const name = side === 1 ? "north" : "south";
  return [
    {
      id: `hull-${name}`,
      parent: "keel",
      points: face(HULL),
      hinge: hingeOf(face(HULL)),
      angle: 1.2,
      toward: "up",
      window: [0, 0.45],
    },
    {
      id: `sail-${name}`,
      parent: `hull-${name}`,
      points: face(SAIL),
      hinge: hingeOf(face(SAIL)),
      angle: 0.76,
      toward: "up",
      window: [0.5, 0.95],
    },
  ];
}

function boatEnd(end: 1 | -1): FacetSpec {
  return {
    id: end === 1 ? "bow" : "stern",
    parent: "keel",
    points: [
      [0.7 * end, -0.08],
      [1.08 * end, 0],
      [0.7 * end, 0.08],
    ],
    hinge: hingeOf([
      [0.7 * end, -0.08],
      [0.7 * end, 0.08],
    ]),
    angle: 1.15,
    toward: "up",
    window: [0.28, 0.7],
  };
}

export const boatPattern: FacetSpec[] = [
  {
    id: "keel",
    points: [
      [-0.7, -0.08],
      [0.7, -0.08],
      [0.7, 0.08],
      [-0.7, 0.08],
    ],
  },
  ...boatSide(1),
  ...boatSide(-1),
  boatEnd(1),
  boatEnd(-1),
];
