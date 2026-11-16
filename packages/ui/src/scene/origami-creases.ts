import {
  BufferGeometry,
  type Color,
  Float32BufferAttribute,
  Group,
  LineDashedMaterial,
  LineSegments,
} from "three";

import type { Flat } from "./origami-folds.ts";

/* Steps per crease: enough for the tracing to advance smoothly, dash by dash. */
const STEPS = 48;
/* A hair above the paper's front, so the drawing never fights the sheet for its pixels. */
const LIFT = 0.004;

export interface CreasePattern {
  root: Group;
  lines: LineSegments[];
  materials: LineDashedMaterial[];
}

/* The segments of a list of creases (pairs of points), cut into short steps that carry their distance along
   the crease, plus an offset that shifts a dash pattern along it. */
function crease(points: readonly Flat[], offset: number): BufferGeometry {
  const positions: number[] = [];
  const distances: number[] = [];
  for (let index = 0; index + 1 < points.length; index += 2) {
    const [ax, ay] = points[index] ?? [0, 0];
    const [bx, by] = points[index + 1] ?? [0, 0];
    const length = Math.hypot(bx - ax, by - ay);
    for (let step = 0; step < STEPS; step += 1) {
      const from = step / STEPS;
      const to = (step + 1) / STEPS;
      positions.push(
        ax + (bx - ax) * from,
        ay + (by - ay) * from,
        LIFT,
        ax + (bx - ax) * to,
        ay + (by - ay) * to,
        LIFT,
      );
      distances.push(offset + length * from, offset + length * to);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("lineDistance", new Float32BufferAttribute(distances, 1));
  return geometry;
}

function dashed(dashSize: number, gapSize: number, ink: Color): LineDashedMaterial {
  return new LineDashedMaterial({ color: ink, dashSize, gapSize, transparent: true, opacity: 0 });
}

/* The crease pattern drawn on the sheet before any fold: valleys in dashes, mountains in dash and dot, as
   origami diagrams draw them. */
export function createCreasePattern(
  creases: { valley: readonly Flat[]; mountain: readonly Flat[] },
  ink: Color,
): CreasePattern {
  const materials = [dashed(0.07, 0.05, ink), dashed(0.1, 0.08, ink), dashed(0.014, 0.166, ink)];
  const [valley, mountain, dot] = materials;
  const lines = [
    new LineSegments(crease(creases.valley, 0), valley),
    new LineSegments(crease(creases.mountain, 0), mountain),
    new LineSegments(crease(creases.mountain, 0.13), dot),
  ];
  const root = new Group();
  root.add(...lines);
  return { root, lines, materials };
}

/* Traces the pattern to `amount` (0 to 1), crease after crease, the valleys first, at `opacity`. */
export function tracePattern(pattern: CreasePattern, amount: number, opacity: number): void {
  pattern.lines.forEach((line, index) => {
    const order = index === 0 ? 0 : 1;
    const local = Math.min(Math.max(amount * 2 - order, 0), 1);
    const count = line.geometry.getAttribute("position").count;
    line.geometry.setDrawRange(0, Math.floor((count * local) / 2) * 2);
  });
  for (const material of pattern.materials) {
    Object.assign(material, { opacity });
  }
}

export function disposeCreasePattern(pattern: CreasePattern): void {
  for (const line of pattern.lines) {
    line.geometry.dispose();
  }
  for (const material of pattern.materials) {
    material.dispose();
  }
}
