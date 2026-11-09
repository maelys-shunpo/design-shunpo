/* The brand guide's shuriken (logo 2025) as a hole cut through a dark layer: four sharp points with straight
   edges, measured in a 100 × 100 box around its centre. */
type Point = readonly [number, number];

const STAR: readonly Point[] = [
  [50, 0.69],
  [67.51, 32.49],
  [99.31, 50],
  [67.51, 67.51],
  [50, 99.31],
  [32.49, 67.51],
  [0.69, 50],
  [32.49, 32.49],
];

const MAX_SCALE = 400;
const SEARCH_STEPS = 40;

/* While the cut grows to cover the screen, the shuriken turns three eighths, most of it early. */
export const CUT_TURN_DEGREES = 135;
const TURN_EASE_POWER = 2.2;

/* The shuriken's turn, in degrees, when the cut has gone `progress` of the way. */
export function cutTurn(progress: number): number {
  return CUT_TURN_DEGREES * (1 - (1 - progress) ** TURN_EASE_POWER);
}

/* The star's corners at `scale` (1 = 100 px across), turned by `degrees`, around `centre`. */
export function starPoints(scale: number, degrees: number, [cx, cy]: Point): Point[] {
  const angle = (degrees * Math.PI) / 180;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return STAR.map(([x, y]) => {
    const [dx, dy] = [(x - 50) * scale, (y - 50) * scale];
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  });
}

function inside([x, y]: Point, polygon: readonly Point[]): boolean {
  let crossings = false;
  for (
    let index = 0, previous = polygon.length - 1;
    index < polygon.length;
    previous = index, index += 1
  ) {
    const [ax, ay] = polygon[index] ?? [0, 0];
    const [bx, by] = polygon[previous] ?? [0, 0];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) {
      crossings = !crossings;
    }
  }
  return crossings;
}

/* The smallest scale at which the star, turned by `degrees`, covers a `width` × `height` screen. */
export function coverScale(width: number, height: number, degrees: number): number {
  const corners: Point[] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  let [low, high] = [1, MAX_SCALE];
  for (let step = 0; step < SEARCH_STEPS; step += 1) {
    const scale = (low + high) / 2;
    const star = starPoints(scale, degrees, [width / 2, height / 2]);
    if (corners.every((corner) => inside(corner, star))) {
      high = scale;
    } else {
      low = scale;
    }
  }
  return high;
}

function pathOf(points: readonly Point[]): string {
  return `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;
}

interface NightShape {
  /* 0: a card in the middle of the screen, top right corner cut; 1: the whole screen. */
  enter: number;
  card: { width: number; height: number };
  corner: number;
  /* The shuriken cut through it. */
  scale: number;
  degrees: number;
}

function cardPath(width: number, height: number, { enter, card, corner }: NightShape): string {
  const insetX = ((width - Math.min(card.width, width)) / 2) * (1 - enter);
  const insetY = ((height - Math.min(card.height, height)) / 2) * (1 - enter);
  const cut = corner * (1 - enter);
  const [left, top, right, bottom] = [insetX, insetY, width - insetX, height - insetY];
  return pathOf([
    [left, top],
    [right - cut, top],
    [right, top + cut],
    [right, bottom],
    [left, bottom],
  ]);
}

/* The night layer's `clip-path`: a card growing to the whole screen, the shuriken cut out of its middle. */
export function nightClip(width: number, height: number, shape: NightShape): string {
  const hole = starPoints(shape.scale, shape.degrees, [width / 2, height / 2]);
  return `path(evenodd,"${cardPath(width, height, shape)} ${pathOf(hole)}")`;
}
