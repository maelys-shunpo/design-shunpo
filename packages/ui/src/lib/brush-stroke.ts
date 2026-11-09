import {
  dashPattern,
  linePath,
  offsetPoint,
  type Point,
  pointAt,
  type Random,
  seededRandom,
  shapePath,
  smoothStep,
  strokeFrame,
  type StrokeFrame,
} from "./brush-path.ts";

/* A sumi brush stroke: the brush lands with a press, the wet body runs along the line,
   then the ink runs out and the hairs split into dry bristles toward the tail. */

export interface BrushStrokeSpec {
  points: readonly Point[];
  width: number;
  seed: number;
}

/* A dashed line of ink along the stroke (a bristle) or of bare paper inside it (a groove). */
export interface BrushTrace {
  path: string;
  width: number;
  dashes: string;
  opacity: number;
}

export interface BrushStroke {
  body: string;
  bristles: BrushTrace[];
  grooves: BrushTrace[];
  centre: string;
  revealWidth: number;
}

interface Brush {
  frame: StrokeFrame;
  width: (t: number) => number;
  base: number;
  random: Random;
}

interface Span {
  from: number;
  to: number;
}

const TAU = Math.PI * 2;
const SAMPLES = 64;
const DRY = 0.66;
const BODY_END = Math.min(1, DRY + 0.16);
const PRESS = 0.35;
const TAIL_THIN = 0.6;
const ENTRY = 0.06;
const CAP_POINTS = 10;
const CAP_LENGTH = 0.7;
const CAP_SKEW = 0.45;
const LANES = 8;
const GROOVES = 3;

function waves(random: Random, frequencies: readonly [number, number]): (t: number) => number {
  const [slow, fast] = frequencies;
  const slowPhase = random() * TAU;
  const fastPhase = random() * TAU;
  return (t) => Math.sin(TAU * slow * t + slowPhase) + 0.5 * Math.sin(TAU * fast * t + fastPhase);
}

function widthProfile(base: number, random: Random): (t: number) => number {
  const wobble = waves(random, [1.1, 3.3]);
  const taperFrom = Math.max(0.3, DRY - 0.22);
  return (t) => {
    const press = 1 + PRESS * Math.exp(-(((t - ENTRY * 0.55) / (ENTRY * 0.75)) ** 2));
    const landing = 0.68 + 0.32 * smoothStep(0, ENTRY, t);
    const taper = 1 - TAIL_THIN * smoothStep(taperFrom, 1, t) ** 1.25;
    return base * press * landing * (1 + 0.06 * wobble(t)) * taper;
  };
}

function sampleShare(index: number): number {
  return index / (SAMPLES - 1);
}

function sampleIndex(t: number): number {
  return Math.round(t * (SAMPLES - 1));
}

function bodySide(brush: Brush, side: 1 | -1): Point[] {
  const edge = waves(brush.random, [19, 47]);
  const last = sampleIndex(BODY_END);
  return brush.frame.points.slice(0, last + 1).map((point, index) => {
    const t = sampleShare(index);
    const core = t < DRY ? 1 : 1 - 0.94 * smoothStep(DRY, BODY_END, t);
    const ragged = 1 + 0.03 * edge(t) + (brush.random() - 0.5) * 0.022;
    const half = (brush.width(t) * core * ragged) / 2;
    return offsetPoint(point, pointAt(brush.frame.normals, index), side * half);
  });
}

/* The rounded, slightly skewed blot where the brush first touches the paper. */
function landingCap(brush: Brush): Point[] {
  const start = pointAt(brush.frame.points, 0);
  const tangent = pointAt(brush.frame.tangents, 0);
  const normal = pointAt(brush.frame.normals, 0);
  const half = brush.width(0) / 2;
  return Array.from({ length: CAP_POINTS - 1 }, (_, step) => {
    const angle = -Math.PI / 2 + (Math.PI * (step + 1)) / CAP_POINTS;
    const across = half * Math.sin(angle) * (1 + (brush.random() - 0.5) * 0.03);
    const along = -half * CAP_LENGTH * Math.cos(angle) - CAP_SKEW * across;
    return offsetPoint(offsetPoint(start, tangent, along), normal, across);
  });
}

function bodyOutline(brush: Brush): string {
  const left = bodySide(brush, 1);
  const right = bodySide(brush, -1);
  return shapePath([...left, ...right.toReversed(), ...landingCap(brush)]);
}

/* A lane is nearly straight: every other sample draws it as well and keeps the image light. */
function lanePath(brush: Brush, span: Span, lane: number): string {
  const first = sampleIndex(span.from);
  const last = sampleIndex(span.to);
  const indices = Array.from(
    { length: Math.ceil((last - first) / 2) },
    (_, step) => first + step * 2,
  );
  return linePath(
    [...indices, last].map((index) =>
      offsetPoint(
        pointAt(brush.frame.points, index),
        pointAt(brush.frame.normals, index),
        lane * brush.width(sampleShare(index)),
      ),
    ),
  );
}

/* Spans that touch become one, so the dash pattern carries no empty gaps. */
function joined(spans: readonly Span[]): Span[] {
  const merged: Span[] = [];
  for (const span of spans) {
    const previous = merged.at(-1);
    if (previous !== undefined && previous.to >= span.from) {
      merged.splice(-1, 1, { from: previous.from, to: span.to });
    } else {
      merged.push(span);
    }
  }
  return merged;
}

/* Alternating ink and gap lengths along a lane, from the spans that carry ink. */
function dashesFor(inked: readonly Span[], lane: Span): string {
  const length = lane.to - lane.from || 1;
  const lengths = [0];
  let cursor = lane.from;
  for (const span of joined(inked)) {
    lengths.push((span.from - cursor) / length, (span.to - span.from) / length);
    cursor = span.to;
  }
  lengths.push((lane.to - cursor) / length);
  return dashPattern(lengths);
}

/* The dry part of a lane: inked spans that shorten and part further as the brush runs out. */
function dryInk(brush: Brush, lane: Span, edgeness: number): Span[] {
  const inked: Span[] = [];
  let t = lane.from;
  while (t < lane.to && inked.length < 40) {
    const dryness = Math.max(0, (t - DRY) / (1 - DRY));
    const gapChance = 0.04 + 0.62 * dryness ** 1.4 * (0.55 + 0.7 * edgeness);
    const end = Math.min(lane.to, t + (0.02 + brush.random() * 0.08) * (1 - 0.55 * dryness));
    if (brush.random() > gapChance) {
      inked.push({ from: t, to: end });
    }
    t =
      end +
      (brush.random() < gapChance ? 0.004 + brush.random() * 0.035 * Math.max(0.25, dryness) : 0);
  }
  return inked;
}

function bristle(brush: Brush, index: number): BrushTrace {
  const { random } = brush;
  const lane = -0.5 + (index + 0.5) / LANES + (random() - 0.5) * (0.5 / LANES);
  const thickness = (1 / LANES) * (0.5 + random() * 0.95);
  const edgeness = Math.min(1, Math.abs(lane) * 2);
  const span = {
    from: Math.max(0.02, DRY - 0.1) + random() * 0.03,
    to: Math.min(1, 1 - random() * 0.05 - edgeness * random() * 0.24),
  };
  return {
    path: lanePath(brush, span, lane),
    width: thickness * brush.base,
    dashes: dashesFor(dryInk(brush, span, edgeness), span),
    opacity: 0.72 + random() * 0.28,
  };
}

/* A pale line where hairs part inside the wet body. */
function groove(brush: Brush): BrushTrace {
  const { random } = brush;
  const lane = -0.4 + random() * 0.8;
  const span = { from: 0.05 + random() * 0.12, to: Math.min(BODY_END - 0.02, DRY + 0.06) };
  const inked: Span[] = [];
  for (let t = span.from; t < span.to;) {
    const end = Math.min(span.to, t + 0.05 + random() * 0.25);
    if (random() < 0.75) {
      inked.push({ from: t, to: end });
    }
    t = end + 0.01 + random() * 0.06;
  }
  return {
    path: lanePath(brush, span, lane),
    width: (0.01 + random() * 0.03) * brush.base,
    dashes: dashesFor(inked, span),
    opacity: 0.08 + random() * 0.2,
  };
}

/* The path the brush follows, extended past both ends so a reveal along it uncovers the whole stroke. */
function centreLine(brush: Brush): string {
  const { points, tangents } = brush.frame;
  const before = offsetPoint(pointAt(points, 0), pointAt(tangents, 0), -brush.base * 1.2);
  const after = offsetPoint(
    pointAt(points, -1 + points.length),
    pointAt(tangents, points.length - 1),
    brush.base * 0.6,
  );
  return linePath([
    before,
    ...points.filter((_, index) => index % 3 === 0),
    pointAt(points, points.length - 1),
    after,
  ]);
}

export function paintBrushStroke({ points, width, seed }: BrushStrokeSpec): BrushStroke {
  const random = seededRandom(seed);
  const brush: Brush = {
    frame: strokeFrame(points, SAMPLES),
    width: widthProfile(width, random),
    base: width,
    random,
  };
  return {
    body: bodyOutline(brush),
    grooves: Array.from({ length: GROOVES }, () => groove(brush)),
    bristles: Array.from({ length: LANES }, (_, index) => bristle(brush, index)),
    centre: centreLine(brush),
    revealWidth: width * (1 + PRESS) * 1.6,
  };
}
