import { hingeOf, mirrorX, mirrorY, OVER } from "./origami-flat.ts";
import type { FacetSpec, Flat } from "./origami-folds.ts";

/* The paper plane, from an A-series sheet: the two top corners fold to the centre line, the sheet folds in half
   along it into a keel (the centre crease at the bottom), then each side folds back out into a wing. Nose toward +y, front of the paper up. */
const W = 0.8;
const L = 1.1;
const KEEL = 0.13;
const NOSE: Flat = [0, L];
const SHOULDER = L - W;
const KEEL_RIGHT: Flat[] = [NOSE, [0, -L], [KEEL, -L]];
const WING_RIGHT: Flat[] = [NOSE, [KEEL, -L], [W, -L], [W, SHOULDER]];
const CORNER_RIGHT: Flat[] = [NOSE, [W, L], [W, SHOULDER]];
const CENTRE = hingeOf([[0, -L], NOSE]);

export const planePattern: FacetSpec[] = [
  { id: "spine", points: [NOSE, [0, -L], [0.001, -L]] },
  ...([1, -1] as const).flatMap((side): FacetSpec[] => {
    const face = side === 1 ? (points: Flat[]) => points : mirrorX;
    const name = side === 1 ? "right" : "left";
    return [
      {
        id: `keel-${name}`,
        parent: "spine",
        points: face(KEEL_RIGHT),
        hinge: CENTRE,
        angle: 1.32,
        toward: "up",
        window: [0.34, 0.66],
      },
      {
        id: `wing-${name}`,
        parent: `keel-${name}`,
        points: face(WING_RIGHT),
        hinge: hingeOf(face([NOSE, [KEEL, -L]])),
        angle: 1.46,
        toward: "down",
        window: [0.6, 0.94],
      },
      {
        id: `corner-${name}`,
        parent: `wing-${name}`,
        points: face(CORNER_RIGHT),
        hinge: hingeOf(face([NOSE, [W, SHOULDER]])),
        angle: OVER,
        toward: "up",
        window: side === 1 ? [0, 0.3] : [0.08, 0.38],
      },
    ];
  }),
];

/* The crane, from the spread bird base: a ridged body, two raised wings, a neck and a tail that rise, a head
   turned down. Head toward +x. */
const BODY: Flat[] = [
  [-0.45, 0],
  [0.45, 0],
  [0.3, -0.26],
  [-0.3, -0.26],
];
const WING: Flat[] = [
  [-0.3, -0.26],
  [0.3, -0.26],
  [-0.05, -1.3],
];
const RIDGE = hingeOf([
  [-0.45, 0],
  [0.45, 0],
]);

interface Fin {
  id: string;
  parent: string;
  /* Where the fin leaves its parent and where it ends, along the spine (x). */
  from: number;
  to: number;
  width: number;
  /* How far the fin turns up (positive) or down (negative) from its parent. */
  rise: number;
}

/* A neck, a head or a tail: a strip hinged across the spine that rises, carrying two halves folded up against
   each other along its centre line, so the piece stands as a thin upright fin, as a reverse fold makes it. */
function fin({ id, parent, from, to, width, rise }: Fin): FacetSpec[] {
  const toward = rise > 0 ? ("up" as const) : ("down" as const);
  const strip: FacetSpec = {
    id,
    parent,
    points: [
      [from, 0.001],
      [from, -0.001],
      [to, 0],
    ],
    hinge: hingeOf([
      [from, 0.001],
      [from, -0.001],
    ]),
    angle: Math.abs(rise),
    toward,
    window: [0.42, 0.82],
  };
  const half: Flat[] = [
    [from, 0],
    [to, 0],
    [from, width],
  ];
  return [
    strip,
    ...[half, mirrorY(half)].map((points, side): FacetSpec => ({
      id: `${id}-${side}`,
      parent: id,
      points,
      hinge: hingeOf(points),
      angle: 1.48,
      toward: "up",
      window: [0.3, 0.6],
    })),
  ];
}

export const cranePattern: FacetSpec[] = [
  {
    id: "spine",
    points: [
      [-0.45, 0.001],
      [0.45, 0.001],
      [0.45, -0.001],
    ],
  },
  ...([1, -1] as const).flatMap((side): FacetSpec[] => {
    const face = side === 1 ? (points: Flat[]) => points : mirrorY;
    const name = side === 1 ? "right" : "left";
    return [
      {
        id: `body-${name}`,
        parent: "spine",
        points: face(BODY),
        hinge: RIDGE,
        angle: 0.55,
        toward: "down",
        window: [0, 0.32],
      },
      {
        id: `wing-${name}`,
        parent: `body-${name}`,
        points: face(WING),
        hinge: hingeOf(face(WING)),
        angle: 1.25,
        toward: "up",
        window: side === 1 ? [0.2, 0.62] : [0.24, 0.66],
      },
    ];
  }),
  ...fin({ id: "neck", parent: "spine", from: 0.45, to: 1.12, width: 0.12, rise: 1.15 }),
  ...fin({ id: "head", parent: "neck", from: 1.12, to: 1.42, width: 0.05, rise: -1.75 }),
  ...fin({ id: "tail", parent: "spine", from: -0.45, to: -1.4, width: 0.12, rise: 0.95 }),
];
