/* The primitives the Instant drawings are made of, and the sampler that spreads ink over them.
   One frame for every drawing (x and y from -1 to 1) and one order: sorted along the same diagonal, particle i
   keeps its place from drawing to drawing, so a jump reads as the page redrawing itself rather than a swarm.
   Deterministic: every value derives from the particle index, so the first frame, and the poster, never change. */

export type Point = [x: number, y: number];
/* left, bottom, width, height */
export type Box = [left: number, bottom: number, width: number, height: number];

export interface Primitive {
  area: number;
  /* u and v in [0, 1): a point of the primitive, uniformly spread. */
  pick: (u: number, v: number) => Point;
}

export interface Group {
  share: number;
  primitives: Primitive[];
  red?: boolean;
}

export interface Drawing {
  points: Float32Array;
  red: Float32Array;
}

/* A well-spread pseudo-random value in [0, 1) for an index and a channel. */
export function unit(index: number, channel: number): number {
  let value = Math.imul(index ^ Math.imul(channel + 1, 0x9e_37_79_b9), 0x85_eb_ca_6b);
  value ^= value >>> 13;
  value = Math.imul(value, 0xc2_b2_ae_35);
  value ^= value >>> 16;
  return (value >>> 0) / 4_294_967_296;
}

export function rect([left, bottom, width, height]: Box): Primitive {
  return {
    area: width * height,
    pick: (u, v) => [left + u * width, bottom + v * height],
  };
}

export function disc([cx, cy]: Point, outer: number, inner = 0): Primitive {
  return {
    area: Math.PI * (outer * outer - inner * inner),
    pick: (u, v) => {
      const radius = Math.sqrt(inner * inner + u * (outer * outer - inner * inner));
      const angle = v * Math.PI * 2;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    },
  };
}

/* A triangle by its corners, sampled with the square-root fold. */
export function triangle([a, b, c]: [Point, Point, Point]): Primitive {
  const area = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2;
  return {
    area,
    pick: (u, v) => {
      const root = Math.sqrt(u);
      const [wa, wb, wc] = [1 - root, root * (1 - v), root * v];
      return [wa * a[0] + wb * b[0] + wc * c[0], wa * a[1] + wb * b[1] + wc * c[1]];
    },
  };
}

/* A regular polygon, its first corner up. */
export function polygon(centre: Point, radius: number, sides: number): Primitive[] {
  function corner(side: number): Point {
    const angle = (side / sides) * Math.PI * 2 + Math.PI / 2;
    return [centre[0] + radius * Math.cos(angle), centre[1] + radius * Math.sin(angle)];
  }
  return Array.from({ length: sides }, (_, side) =>
    triangle([centre, corner(side), corner(side + 1)]),
  );
}

function bezier([from, control, to]: [Point, Point, Point], u: number): [Point, Point] {
  const inverse = 1 - u;
  const at: Point = [
    inverse * inverse * from[0] + 2 * inverse * u * control[0] + u * u * to[0],
    inverse * inverse * from[1] + 2 * inverse * u * control[1] + u * u * to[1],
  ];
  const tangent: Point = [
    2 * inverse * (control[0] - from[0]) + 2 * u * (to[0] - control[0]),
    2 * inverse * (control[1] - from[1]) + 2 * u * (to[1] - control[1]),
  ];
  return [at, tangent];
}

/* A stroke of ink along a quadratic curve, fuller in its middle like a brush. */
export function stroke(path: [Point, Point, Point], width: number): Primitive {
  const [from, control, to] = path;
  const length =
    Math.hypot(control[0] - from[0], control[1] - from[1]) +
    Math.hypot(to[0] - control[0], to[1] - control[1]);
  return {
    area: length * width,
    pick: (u, v) => {
      const [[x, y], [dx, dy]] = bezier(path, u);
      const norm = Math.max(Math.hypot(dx, dy), 1e-9);
      const offset = (v - 0.5) * width * (0.55 + Math.sin(u * Math.PI) * 0.9);
      return [x - (dy / norm) * offset, y + (dx / norm) * offset];
    },
  };
}

/* A frame drawn as four thin rules. */
export function outline([left, bottom, width, height]: Box, weight: number): Primitive[] {
  return [
    rect([left, bottom, width, weight]),
    rect([left, bottom + height - weight, width, weight]),
    rect([left, bottom, weight, height]),
    rect([left + width - weight, bottom, weight, height]),
  ];
}

function pickIn(primitives: Primitive[], position: number): Primitive | undefined {
  let walked = 0;
  return (
    primitives.find((candidate) => {
      walked += candidate.area;
      return position <= walked;
    }) ?? primitives.at(-1)
  );
}

/* Spreads count points over the groups by their share, and inside a group over its primitives by area. */
export function sample(groups: Group[], count: number, channel: number): Drawing {
  const points = new Float32Array(count * 2);
  const red = new Float32Array(count);
  let start = 0;
  groups.forEach((group, groupIndex) => {
    const end = groupIndex === groups.length - 1 ? count : start + Math.round(group.share * count);
    const total = group.primitives.reduce((sum, primitive) => sum + primitive.area, 0);
    for (let index = start; index < end; index += 1) {
      const primitive = pickIn(group.primitives, ((index - start + 0.5) / (end - start)) * total);
      const [x, y] = primitive?.pick(unit(index, channel), unit(index, channel + 7)) ?? [0, 0];
      points[index * 2] = x;
      points[index * 2 + 1] = y;
      red[index] = group.red === true ? 1 : 0;
    }
    start = end;
  });
  return { points, red };
}

function diagonal(points: Float32Array, index: number): number {
  return Number(points[index * 2]) * 0.86 + Number(points[index * 2 + 1]) * 0.14;
}

/* The shared order: along a shallow diagonal, from the left. */
export function sortByDiagonal({ points, red }: Drawing): Drawing {
  const count = red.length;
  const order = Array.from({ length: count }, (_, index) => index);
  order.sort((first, second) => diagonal(points, first) - diagonal(points, second));
  const sortedPoints = new Float32Array(count * 2);
  const sortedRed = new Float32Array(count);
  order.forEach((from, to) => {
    sortedPoints[to * 2] = Number(points[from * 2]);
    sortedPoints[to * 2 + 1] = Number(points[from * 2 + 1]);
    sortedRed[to] = Number(red[from]);
  });
  return { points: sortedPoints, red: sortedRed };
}
