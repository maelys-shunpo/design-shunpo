import { Group, Vector3 } from "three";
import { describe, expect, it } from "vitest";

import {
  buildFacets,
  type FacetSpec,
  facetGeometry,
  foldAmount,
  hingeSign,
  setFold,
} from "../src/scene/origami-folds.ts";
import { cranePattern, planePattern } from "../src/scene/origami-patterns-air.ts";
import { boatPattern, masuPattern } from "../src/scene/origami-patterns-ground.ts";
import { bakePiece } from "../src/scene/origami-piece.ts";

const flap: FacetSpec = {
  id: "flap",
  parent: "base",
  points: [
    [0, 0],
    [1, 0],
    [0.5, 1],
  ],
  hinge: [
    [0, 0],
    [1, 0],
  ],
  angle: Math.PI / 2,
  toward: "up",
};
const base: FacetSpec = {
  id: "base",
  points: [
    [0, 0],
    [1, -1],
    [1, 0],
  ],
};

function tipHeight(spec: FacetSpec): number {
  const root = new Group();
  const facets = buildFacets([base, spec], root);
  setFold(facets, 1, { flutter: 0, rest: 0 });
  root.updateMatrixWorld(true);
  const tip = facets.at(-1);
  return new Vector3(0.5, 1, 0).applyMatrix4(tip?.pivot.matrixWorld ?? root.matrixWorld).z;
}

function hungInOrder(pattern: readonly FacetSpec[]): boolean {
  const seen = new Set<string>();
  return pattern.every((spec) => {
    const ordered = spec.parent === undefined || seen.has(spec.parent);
    seen.add(spec.id);
    return ordered;
  });
}

function widthOf(pattern: readonly FacetSpec[]): number {
  const geometry = bakePiece(pattern, 1);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  return box === null ? 0 : box.max.x - box.min.x;
}

describe("hinges", () => {
  it("turns a facet toward the side asked for, whichever way its hinge is drawn", () => {
    expect(hingeSign(flap)).toBe(1);
    expect(
      hingeSign({
        ...flap,
        hinge: [
          [1, 0],
          [0, 0],
        ],
      }),
    ).toBe(-1);
    expect(hingeSign({ ...flap, toward: "down" })).toBe(-1);
    expect(hingeSign(base)).toBe(0);
  });

  it("folds a flap up off the sheet, and down below it", () => {
    expect(tipHeight(flap)).toBeCloseTo(1, 5);
    expect(tipHeight({ ...flap, toward: "down" })).toBeCloseTo(-1, 5);
  });

  it("remembers its creases at rest: a pre-creased sheet is never perfectly flat", () => {
    const root = new Group();
    const facets = buildFacets([base, flap], root);
    setFold(facets, 0, { flutter: 0, rest: 0.1 });
    expect(facets.at(-1)?.pivot.quaternion.angleTo(root.quaternion)).toBeCloseTo(
      (Math.PI / 2) * 0.1,
      5,
    );
  });

  it("eases each fold over its own window", () => {
    expect(foldAmount(0.1, [0.2, 0.4])).toBe(0);
    expect(foldAmount(0.3, [0.2, 0.4])).toBeCloseTo(0.5, 5);
    expect(foldAmount(0.9, [0.2, 0.4])).toBe(1);
  });

  it("draws a convex facet as a fan around its pivot", () => {
    const geometry = facetGeometry(
      [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
      ],
      [1, 1],
    );
    expect(geometry.getAttribute("position").count).toBe(6);
    expect(geometry.getAttribute("position").getX(0)).toBe(-1);
  });
});

describe("crease patterns", () => {
  it.each([
    ["plane", planePattern],
    ["crane", cranePattern],
    ["masu", masuPattern],
    ["boat", boatPattern],
  ])("hangs every facet of the %s on a parent that comes before it", (_name, pattern) => {
    expect(hungInOrder(pattern)).toBe(true);
    expect(new Set(pattern.map((spec) => spec.id)).size).toBe(pattern.length);
  });

  it("bakes the folded plane into one geometry for the flock", () => {
    /* Folded, the wings close in: the plane is narrower than the flat sheet's 1.6. */
    expect(widthOf(planePattern)).toBeGreaterThan(0.3);
    expect(widthOf(planePattern)).toBeLessThan(1.6);
  });
});
