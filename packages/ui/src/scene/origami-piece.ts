import {
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  type LineBasicMaterial,
  LineSegments,
  type Material,
  Mesh,
} from "three";

import { buildFacets, type Facet, type FacetSpec, setFold } from "./origami-folds.ts";

export interface Piece {
  /* Placed and posed in the world; holds the sheet, turned so the paper lies flat, front up. */
  root: Group;
  facets: Facet[];
  edges: BufferGeometry[];
}

/* A piece of folded paper: one mesh and one crease outline per facet, hung on the hinge tree. */
export function createPiece(
  specs: readonly FacetSpec[],
  paper: Material,
  creases: LineBasicMaterial,
): Piece {
  const root = new Group();
  const sheet = new Group();
  sheet.rotation.x = -Math.PI / 2;
  root.add(sheet);
  const facets = buildFacets(specs, sheet);
  const edges = facets.map((facet) => {
    const outline = new EdgesGeometry(facet.geometry);
    const sheetMesh = new Mesh(facet.geometry, paper);
    sheetMesh.castShadow = true;
    sheetMesh.receiveShadow = true;
    facet.pivot.add(sheetMesh, new LineSegments(outline, creases));
    return outline;
  });
  return { root, facets, edges };
}

export function disposePiece(piece: Piece): void {
  for (const facet of piece.facets) {
    facet.geometry.dispose();
  }
  for (const outline of piece.edges) {
    outline.dispose();
  }
}

/* One geometry of a piece folded to `fold`, every facet moved by its hinges: the flock draws it many times
   from a single buffer. */
export function bakePiece(specs: readonly FacetSpec[], fold: number): BufferGeometry {
  const root = new Group();
  const sheet = new Group();
  sheet.rotation.x = -Math.PI / 2;
  root.add(sheet);
  const facets = buildFacets(specs, sheet);
  setFold(facets, fold, { flutter: 0, rest: 0 });
  root.updateMatrixWorld(true);
  const positions: number[] = [];
  for (const facet of facets) {
    const moved = facet.geometry.clone().applyMatrix4(facet.pivot.matrixWorld);
    positions.push(...moved.getAttribute("position").array);
    moved.dispose();
    facet.geometry.dispose();
  }
  const baked = new BufferGeometry();
  baked.setAttribute("position", new Float32BufferAttribute(positions, 3));
  baked.computeVertexNormals();
  return baked;
}
