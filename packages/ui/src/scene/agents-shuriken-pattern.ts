import { OVER } from "./origami-flat.ts";
import type { FacetSpec, Flat } from "./origami-folds.ts";

/* The SHUNPO glyph, measured on its path (`brand/shuriken-paths.ts`): a valley sits at 0.52 of a point's reach
   from the centre, the round hole at 0.27, and each point closes on sixty degrees. */
export const LOGO = { valley: 0.52, hole: 0.27, tipDegrees: 60 } as const;

/* One branch of the sign is one square sheet, laid as a diamond in its own plane: the point at (0, 1), the
   punched corner at the centre of the sign (0, 0), the side corners at (±0.5, 0.5). The side corners fold over
   the front along lines from the point at half the logo's tip from the axis, which leaves the coloured face
   showing down the middle; a ridge runs down the axis. */
const HALF_TIP = ((LOGO.tipDegrees / 2) * Math.PI) / 180;
/* How far down a fold line runs from the point before it meets the edge from the centre to a side corner. */
const REACH = 1 / (Math.cos(HALF_TIP) + Math.sin(HALF_TIP));
const ARC_STEPS = 6;
const QUARTER = Math.PI / 2;
const EIGHTH = Math.PI / 4;
/* Each half's punched edge runs two degrees past its share, under the next branch: neighbours overlap at the
   hole, as interlocked paper does, and no slit opens between them. */
const TUCK = (2 * Math.PI) / 180;

function valleyOn(side: -1 | 1): Flat {
  return [side * REACH * Math.sin(HALF_TIP), 1 - REACH * Math.cos(HALF_TIP)] as const;
}

export const BRANCH = {
  tip: [0, 1] as Flat,
  flapLeft: [-0.5, 0.5] as Flat,
  flapRight: [0.5, 0.5] as Flat,
  valleyLeft: valleyOn(-1),
  valleyRight: valleyOn(1),
  hole: LOGO.hole,
  /* The ridge down the axis, in radians: enough for the light to split each point into two values. */
  ridge: 0.46,
} as const;

/* The punched corner: a share of the hole on each half of the sheet, from the axis to the centre–corner edge. */
function arc(from: number, to: number): Flat[] {
  return Array.from({ length: ARC_STEPS + 1 }, (_, step) => {
    const angle = from + ((to - from) * step) / ARC_STEPS;
    return [Math.cos(angle) * BRANCH.hole, Math.sin(angle) * BRANCH.hole] as const;
  });
}

/* Counter-clockwise outlines, front up: the left half of the core is the fixed facet, the right half turns down
   along the axis for the ridge, and each side flap folds over the front from its half, the left one leading. */
export function branchPattern(): FacetSpec[] {
  const { tip, flapLeft, flapRight, valleyLeft, valleyRight } = BRANCH;
  return [
    { id: "core-left", points: [tip, valleyLeft, ...arc(QUARTER + EIGHTH + TUCK, QUARTER)] },
    {
      id: "core-right",
      parent: "core-left",
      points: [tip, ...arc(QUARTER, EIGHTH - TUCK), valleyRight],
      hinge: [[0, BRANCH.hole], tip],
      angle: BRANCH.ridge,
      toward: "down",
      window: [0.7, 1],
    },
    {
      id: "flap-left",
      parent: "core-left",
      points: [tip, flapLeft, valleyLeft],
      hinge: [valleyLeft, tip],
      angle: OVER,
      toward: "up",
      window: [0, 0.62],
    },
    {
      id: "flap-right",
      parent: "core-right",
      points: [tip, valleyRight, flapRight],
      hinge: [valleyRight, tip],
      angle: OVER,
      toward: "up",
      window: [0.22, 0.84],
    },
  ];
}

/* A quarter turn clockwise in the plane of the sign, so the branches follow one another as on a clock. */
function clockwise([x, y]: Flat, quarters: number): Flat {
  const angle = -quarters * QUARTER;
  return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
}

type Outline = [Flat, Flat, Flat, Flat, Flat, Flat, Flat, Flat];

/* The sign's silhouette once the four branches have turned into place, from the top point clockwise: point,
   valley, point, valley… in the plane of the sign, its centre at the origin. */
export function starOutline(): Outline {
  const { tip, valleyRight } = BRANCH;
  return [
    clockwise(tip, 0),
    clockwise(valleyRight, 0),
    clockwise(tip, 1),
    clockwise(valleyRight, 1),
    clockwise(tip, 2),
    clockwise(valleyRight, 2),
    clockwise(tip, 3),
    clockwise(valleyRight, 3),
  ];
}
