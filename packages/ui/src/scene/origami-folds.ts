import { BufferGeometry, Float32BufferAttribute, Group, Quaternion, Vector3 } from "three";

/* A point of the flat sheet, in the sheet's own plane (x, y); the front of the paper faces +z. */
export type Flat = readonly [x: number, y: number];

/* One facet of a crease pattern. A facet with a parent turns about a hinge, an edge it shares with that parent,
   by `angle` radians toward the front (`up`) or the back (`down`) of the parent, during its `window` of the
   piece's fold (0 to 1). A facet without a parent is the fixed one the others fold from. */
export interface FacetSpec {
  id: string;
  points: readonly Flat[];
  parent?: string;
  hinge?: readonly [Flat, Flat];
  angle?: number;
  toward?: "up" | "down";
  window?: readonly [start: number, end: number];
}

export interface Facet {
  id: string;
  pivot: Group;
  axis: Vector3;
  angle: number;
  window: readonly [number, number];
  geometry: BufferGeometry;
}

function centroid(points: readonly Flat[]): Flat {
  const sum = points.reduce<[number, number]>(([x, y], [px, py]) => [x + px, y + py], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

/* The sign that turns the facet toward the side asked for: the right-hand rule about the hinge, read on the
   facet's centre. Written once here, so a pattern only says « up » or « down ». */
export function hingeSign(spec: FacetSpec): number {
  if (spec.hinge === undefined) {
    return 0;
  }
  const [[ax, ay], [bx, by]] = spec.hinge;
  const [cx, cy] = centroid(spec.points);
  const lift = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const side = spec.toward === "down" ? -1 : 1;
  return Math.sign(lift) * side;
}

/* A flat convex facet as a triangle fan, its vertices relative to its own pivot. */
export function facetGeometry(points: readonly Flat[], [ox, oy]: Flat): BufferGeometry {
  const positions: number[] = [];
  const [first = [0, 0]] = points;
  for (let index = 1; index < points.length - 1; index += 1) {
    const [bx, by] = points[index] ?? first;
    const [cx, cy] = points[index + 1] ?? first;
    positions.push(first[0] - ox, first[1] - oy, 0, bx - ox, by - oy, 0, cx - ox, cy - oy, 0);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  const uvs = positions.filter((_, index) => index % 3 !== 2).map((value) => value * 0.5 + 0.5);
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function pivotOf(spec: FacetSpec): Flat {
  return spec.hinge?.[0] ?? [0, 0];
}

/* Builds the hinge tree: each facet's pivot sits on its hinge, inside its parent's pivot, so turning a parent
   carries every facet folded from it, as paper does. */
export function buildFacets(specs: readonly FacetSpec[], root: Group): Facet[] {
  const facets = new Map<string, Facet>();
  for (const spec of specs) {
    const parent = spec.parent === undefined ? undefined : facets.get(spec.parent);
    const origin = pivotOf(spec);
    const parentOrigin = parent === undefined ? ([0, 0] as Flat) : pivotOfFacet(specs, spec.parent);
    const pivot = new Group();
    pivot.position.set(origin[0] - parentOrigin[0], origin[1] - parentOrigin[1], 0);
    (parent?.pivot ?? root).add(pivot);
    const [[ax, ay], [bx, by]] = spec.hinge ?? [
      [0, 0],
      [1, 0],
    ];
    facets.set(spec.id, {
      id: spec.id,
      pivot,
      axis: new Vector3(bx - ax, by - ay, 0).normalize(),
      angle: (spec.angle ?? 0) * hingeSign(spec),
      window: spec.window ?? [0, 1],
      geometry: facetGeometry(spec.points, origin),
    });
  }
  return [...facets.values()];
}

function pivotOfFacet(specs: readonly FacetSpec[], id: string | undefined): Flat {
  const spec = specs.find((candidate) => candidate.id === id);
  return spec === undefined ? [0, 0] : pivotOf(spec);
}

/* Paper creases quickly, then settles: a fold eased in and out over its own window. */
export function foldAmount(fold: number, [start, end]: readonly [number, number]): number {
  const linear = Math.min(Math.max((fold - start) / Math.max(end - start, 1e-6), 0), 1);
  return linear * linear * (3 - 2 * linear);
}

const turn = new Quaternion();

export interface Breath {
  /* Radians of flutter that keep folded paper alive. */
  flutter: number;
  /* The share of every fold the paper remembers at rest: a pre-creased sheet is never perfectly flat. */
  rest: number;
}

/* Sets every hinge for a fold amount, with a breath of flutter and the memory of its creases. */
export function setFold(facets: readonly Facet[], fold: number, { flutter, rest }: Breath): void {
  facets.forEach((facet, index) => {
    const amount = Math.max(foldAmount(fold, facet.window), rest);
    const breath = facet.angle === 0 ? 0 : Math.sin(index * 1.7) * flutter * amount;
    turn.setFromAxisAngle(facet.axis, facet.angle * amount + breath);
    facet.pivot.quaternion.copy(turn);
  });
}
