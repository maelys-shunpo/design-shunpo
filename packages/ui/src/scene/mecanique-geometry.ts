import { Path, Shape } from "three";

/* Outlines of the calibre's parts, in movement units (the main plate has a radius of 1), drawn in the XY plane
   and extruded along z by the calibre. Pure functions: the tests read their points without a renderer. */

const TAU = Math.PI * 2;

export interface WheelSpec {
  teeth: number;
  radius: number;
  /* Depth of a tooth, from root to tip. */
  toothDepth: number;
  /* Crossings: the arms between the rim and the hub. 0 for a full disc (a pinion, the escape wheel's hub). */
  spokes: number;
  /* "gear" for a train wheel; "club" for the escape wheel's leaning teeth. */
  profile?: "gear" | "club";
}

function polar(radius: number, angle: number): [number, number] {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

/* Four points a tooth: up the flank, along the tip, down the other flank, along the root. A club tooth leans
   forward, its tip pushed ahead of its root, the way an escape wheel's teeth catch the pallets. */
function toothPoints(spec: WheelSpec, index: number): Array<[number, number]> {
  const pitch = TAU / spec.teeth;
  const start = index * pitch;
  const root = spec.radius - spec.toothDepth;
  if (spec.profile === "club") {
    return [
      polar(root, start),
      polar(spec.radius, start + pitch * 0.62),
      polar(root, start + pitch * 0.7),
    ];
  }
  return [
    polar(root, start),
    polar(spec.radius, start + pitch * 0.14),
    polar(spec.radius, start + pitch * 0.4),
    polar(root, start + pitch * 0.54),
  ];
}

export function wheelOutline(spec: WheelSpec): Array<[number, number]> {
  return Array.from({ length: spec.teeth }, (_, index) => toothPoints(spec, index)).flat();
}

/* Windows between the arms: annular sectors from the hub to the rim. */
function crossingHoles(spec: WheelSpec): Path[] {
  const rim = spec.radius - spec.toothDepth - spec.radius * 0.14;
  const hub = spec.radius * 0.24;
  const arm = 0.32 / spec.spokes;
  return Array.from({ length: spec.spokes }, (_, index) => {
    const from = (index / spec.spokes) * TAU + arm;
    const to = ((index + 1) / spec.spokes) * TAU - arm;
    const hole = new Path();
    hole.absarc(0, 0, rim, from, to, false);
    hole.absarc(0, 0, hub, to, from, true);
    hole.closePath();
    return hole;
  });
}

function circleHole(radius: number, x = 0, y = 0): Path {
  const hole = new Path();
  hole.absarc(x, y, radius, 0, TAU, true);
  return hole;
}

export function wheelShape(spec: WheelSpec): Shape {
  const [first, ...rest] = wheelOutline(spec);
  const shape = new Shape();
  shape.moveTo(...(first ?? [0, 0]));
  for (const point of rest) {
    shape.lineTo(...point);
  }
  shape.closePath();
  shape.holes.push(...(spec.spokes > 0 ? crossingHoles(spec) : []), circleHole(spec.radius * 0.07));
  return shape;
}

export interface Hole {
  x: number;
  y: number;
  radius: number;
}

/* The main plate: a disc with the recesses and jewel holes of the movement. */
export function plateShape(radius: number, holes: Hole[]): Shape {
  const shape = new Shape();
  shape.absarc(0, 0, radius, 0, TAU, false);
  shape.holes.push(...holes.map((hole) => circleHole(hole.radius, hole.x, hole.y)));
  return shape;
}

/* A bridge: a bar with round ends from one point to another, pierced at both ends for its screws. */
export function bridgeShape(from: [number, number], to: [number, number], width: number): Shape {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const half = width / 2;
  const shape = new Shape();
  shape.absarc(to[0], to[1], half, angle - Math.PI / 2, angle + Math.PI / 2, false);
  shape.absarc(from[0], from[1], half, angle + Math.PI / 2, angle + (Math.PI * 3) / 2, false);
  shape.closePath();
  shape.holes.push(circleHole(half * 0.32, ...from), circleHole(half * 0.32, ...to));
  return shape;
}

/* A balance wheel: a rim with two arms across. */
export function balanceShape(radius: number, rim: number): Shape {
  const shape = new Shape();
  shape.absarc(0, 0, radius, 0, TAU, false);
  const arm = rim * 0.9;
  for (const side of [1, -1]) {
    const hole = new Path();
    const inner = radius - rim;
    const edge = Math.asin(arm / inner);
    const start = side === 1 ? edge : Math.PI + edge;
    hole.absarc(0, 0, inner, start, start + Math.PI - edge * 2, false);
    hole.closePath();
    shape.holes.push(hole);
  }
  return shape;
}

export interface SpiralSpec {
  turns: number;
  inner: number;
  outer: number;
  steps: number;
}

/* The hairspring: an Archimedean spiral, as points for a line. */
export function spiralPoints({ turns, inner, outer, steps }: SpiralSpec): Array<[number, number]> {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const along = index / steps;
    return polar(inner + (outer - inner) * along, along * turns * TAU);
  });
}
