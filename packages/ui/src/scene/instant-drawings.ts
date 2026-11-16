import {
  disc,
  type Drawing,
  type Group,
  outline,
  type Point,
  polygon,
  type Primitive,
  rect,
  sample,
  sortByDiagonal,
  stroke,
  triangle,
} from "./instant-shapes.ts";

/* The four drawings the ink jumps between, in story order:
   1. your week, every hour taken; 2. your tools, six islands that never touch;
   3. one system, the islands linked by flows; 4. your time, a week mostly free, stamped with the red seal. */

const COLUMNS = 5;
const GUTTER = 0.07;
const COLUMN_WIDTH = (2 - GUTTER * (COLUMNS - 1)) / COLUMNS;
const HOURS = 9;
const TOP = 0.86;
const BOTTOM = -1;
const HOUR = (TOP - BOTTOM) / HOURS;
const BLOCK_GAP = 0.03;

/* Each day of the full week: [first hour, length] of every booked block. */
const FULL_WEEK: Array<Array<[number, number]>> = [
  [
    [0, 2],
    [2, 1],
    [3, 3],
    [6, 1],
    [7, 2],
  ],
  [
    [0, 1],
    [1, 3],
    [4, 2],
    [6, 3],
  ],
  [
    [0, 3],
    [3, 1],
    [4, 1],
    [5, 2],
    [7, 2],
  ],
  [
    [0, 2],
    [2, 2],
    [4, 1],
    [5, 1],
    [6, 3],
  ],
  [
    [0, 1],
    [1, 2],
    [3, 3],
    [6, 1],
    [7, 2],
  ],
];

/* What is left once the repetitive work runs on its own: one block a day, the work that needs a person. */
const FREED_WEEK: Array<[number, number]> = [
  [2, 1],
  [0, 1],
  [4, 1],
  [1, 1],
  [3, 1],
];

function columnLeft(day: number): number {
  return -1 + day * (COLUMN_WIDTH + GUTTER);
}

function block(day: number, [first, length]: [number, number]): Primitive {
  const top = TOP - first * HOUR - BLOCK_GAP / 2;
  const height = length * HOUR - BLOCK_GAP;
  return rect([columnLeft(day), top - height, COLUMN_WIDTH, height]);
}

/* The day markers above each column: a short heavy rule, as in a printed diary. */
function dayMarkers(): Primitive[] {
  return Array.from({ length: COLUMNS }, (_, day) =>
    rect([columnLeft(day), TOP + 0.06, COLUMN_WIDTH * 0.32, 0.035]),
  );
}

function week(): Group[] {
  return [
    { share: 0.05, primitives: dayMarkers() },
    {
      share: 0.95,
      primitives: FULL_WEEK.flatMap((day, index) => day.map((booked) => block(index, booked))),
    },
  ];
}

const ISLANDS: [Point, Point, Point, Point, Point, Point] = [
  [-0.66, 0.52],
  [0.18, 0.7],
  [0.76, 0.12],
  [-0.18, -0.1],
  [-0.7, -0.66],
  [0.4, -0.62],
];

function tools(): Group[] {
  const [first, second, third, fourth, fifth, sixth] = ISLANDS;
  return [
    {
      share: 1,
      primitives: [
        disc(first, 0.3),
        rect([second[0] - 0.21, second[1] - 0.21, 0.42, 0.42]),
        triangle([
          [third[0], third[1] + 0.32],
          [third[0] - 0.28, third[1] - 0.2],
          [third[0] + 0.28, third[1] - 0.2],
        ]),
        disc(fourth, 0.27, 0.16),
        ...polygon(fifth, 0.27, 4),
        ...polygon(sixth, 0.29, 6),
      ],
    },
  ];
}

/* The same six tools, now stations on one closed flow: a loop that waves between them, crossed once in its middle.
   It reads as a process that runs on its own, not as a diagram of boxes. */
const NODES: [Point, Point, Point, Point, Point, Point] = [
  [-0.8, 0.46],
  [-0.02, 0.56],
  [0.8, 0.4],
  [0.74, -0.5],
  [0.02, -0.4],
  [-0.78, -0.56],
];
const [STATION_A, STATION_B, STATION_C, STATION_D, STATION_E, STATION_F] = NODES;
const LINKS: Array<[Point, Point, number]> = [
  [STATION_A, STATION_B, 0.2],
  [STATION_B, STATION_C, -0.16],
  [STATION_C, STATION_D, 0.34],
  [STATION_D, STATION_E, 0.16],
  [STATION_E, STATION_F, -0.2],
  [STATION_F, STATION_A, 0.34],
  [STATION_B, STATION_E, 0.06],
];

function link([a, b, bow]: [Point, Point, number]): Primitive {
  const middle: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const length = Math.max(Math.hypot(middle[0], middle[1]), 1e-9);
  const control: Point = [middle[0] * (1 + bow / length), middle[1] * (1 + bow / length)];
  return stroke([a, control, b], 0.034);
}

function system(): Group[] {
  return [
    {
      share: 0.3,
      primitives: NODES.map((node, index) => disc(node, index % 3 === 1 ? 0.08 : 0.11)),
    },
    { share: 0.7, primitives: LINKS.map((each) => link(each)) },
  ];
}

const SEAL_SIDE = 0.66;
const SEAL_CENTRE: Point = [0.5, -0.46];

const SEAL_TURN = -0.07;

/* Turns a primitive about the seal's centre: a stamp is never set quite square. */
function turned(primitive: Primitive): Primitive {
  const [cx, cy] = SEAL_CENTRE;
  const cos = Math.cos(SEAL_TURN);
  const sin = Math.sin(SEAL_TURN);
  return {
    area: primitive.area,
    pick: (u, v) => {
      const [x, y] = primitive.pick(u, v);
      return [cx + (x - cx) * cos - (y - cy) * sin, cy + (x - cx) * sin + (y - cy) * cos];
    },
  };
}

/* The seal is a square of red ink with its border carved out, as a hanko leaves it. */
function seal(): Primitive[] {
  const [cx, cy] = SEAL_CENTRE;
  const half = SEAL_SIDE / 2;
  const carve = 0.05;
  const groove = 0.026;
  const inner = half - carve - groove;
  return [
    ...outline([cx - half, cy - half, SEAL_SIDE, SEAL_SIDE], carve),
    rect([cx - inner, cy - inner, inner * 2, inner * 2]),
  ].map((primitive) => turned(primitive));
}

function freedTime(): Group[] {
  return [
    { share: 0.03, primitives: dayMarkers() },
    {
      share: 0.17,
      primitives: Array.from({ length: COLUMNS }, (_, day) =>
        outline([columnLeft(day), BOTTOM, COLUMN_WIDTH, TOP - BOTTOM], 0.008),
      ).flat(),
    },
    { share: 0.2, primitives: FREED_WEEK.map((booked, day) => block(day, booked)) },
    { share: 0.6, primitives: seal(), red: true },
  ];
}

export const DRAWING_COUNT = 4;

/* Every drawing for count particles, each sorted in the shared order. Only the last one carries red ink. */
export function buildDrawings(count: number): [Drawing, Drawing, Drawing, Drawing] {
  function drawn(groups: Group[], index: number): Drawing {
    return sortByDiagonal(sample(groups, count, index * 13));
  }
  return [drawn(week(), 0), drawn(tools(), 1), drawn(system(), 2), drawn(freedTime(), 3)];
}
