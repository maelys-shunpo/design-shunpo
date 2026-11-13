import { type DirectionalLight, Float32BufferAttribute, Group, Mesh } from "three";

import { type Rgb, resolveColor } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { createSignGround, type SignGround } from "./agents-shuriken-ground.ts";
import { finalHeading } from "./agents-shuriken-motion.ts";
import {
  createPebbleGeometry,
  createShurikenPapers,
  disposeShurikenPapers,
  type ShurikenMark,
  type ShurikenPapers,
} from "./agents-shuriken-papers.ts";
import { branchPattern } from "./agents-shuriken-pattern.ts";
import type { FacetSpec, Flat } from "./origami-folds.ts";
import { createLights } from "./origami-ground.ts";
import { createPiece, disposePiece, type Piece } from "./origami-piece.ts";

export type { ShurikenMark } from "./agents-shuriken-papers.ts";

export interface Branch {
  /* Placed and turned on the floor of the sign; the piece inside banks about the point's axis. */
  holder: Group;
  piece: Piece;
}

export interface ShurikenWorld {
  root: Group;
  /* The four branches, the pebble and their shadows turn and rise together as one sign. */
  sign: Group;
  branches: Branch[];
  pebble: Mesh;
  key: DirectionalLight;
  rim: DirectionalLight;
  ground: SignGround;
  papers: ShurikenPapers;
  clock: { time: number };
}

/* Each facet's texture coordinates in the sheet's own square (x from -0.5 to 0.5, y from 0 to 1), whatever its
   hinge: the print lies on the sheet, not on the facet. */
function printOnSheet(piece: Piece, specs: readonly FacetSpec[]): void {
  for (const [index, facet] of piece.facets.entries()) {
    const spec = specs[index];
    const [ox, oy]: Flat = spec?.hinge?.[0] ?? [0, 0];
    const positions = facet.geometry.getAttribute("position");
    const uvs: number[] = [];
    for (let vertex = 0; vertex < positions.count; vertex += 1) {
      uvs.push(positions.getX(vertex) + ox + 0.5, positions.getY(vertex) + oy);
    }
    facet.geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  }
}

function createBranch(papers: ShurikenPapers, index: number): Branch {
  const specs = branchPattern();
  const material = papers.sheets[index] ?? papers.pebble;
  const piece = createPiece(specs, material, papers.creases);
  printOnSheet(piece, specs);
  const holder = new Group();
  holder.add(piece.root);
  return { holder, piece };
}

/* Four sheets, one per tool, the SHUNPO pebble out of shot on the right, a contact shadow under each of them, and
   the studio's warm key, cool rim and soft fill. */
export function createShurikenWorld(
  tier: QualityTier,
  palette: Parameters<typeof createShurikenPapers>[1],
  print: { marks: readonly ShurikenMark[]; headings: readonly number[] },
): ShurikenWorld {
  const papers = createShurikenPapers(tier, palette, print);
  const branches = print.marks.map((_, index) => createBranch(papers, index));
  const pebble = new Mesh(createPebbleGeometry(), papers.pebble);
  pebble.castShadow = true;
  pebble.receiveShadow = true;
  const ground = createSignGround(branches.length, tier);
  const { key, rim, fill } = createLights(tier);
  const sign = new Group();
  sign.add(...branches.map((branch) => branch.holder));
  const root = new Group();
  root.add(ground.root, pebble, sign, key, key.target, rim, rim.target, fill);
  return { root, sign, branches, pebble, key, rim, ground, papers, clock: { time: 0 } };
}

export function disposeShurikenWorld(world: ShurikenWorld): void {
  for (const branch of world.branches) {
    disposePiece(branch.piece);
  }
  world.pebble.geometry.dispose();
  disposeShurikenPapers(world.papers);
  world.ground.dispose();
  world.key.shadow.dispose();
}

/* The papers in the direction's colours, read on the canvas so the theme's tokens apply: Shiro, Hikari Frost, a
   light and a deep Blue Tenku, each printed in the ink that reads on it; white backs; the Fushimi pebble. */
export function createShurikenWorldOn(
  canvas: HTMLCanvasElement,
  tier: QualityTier,
  marks: readonly ShurikenMark[],
): ShurikenWorld {
  const ink = resolveColor(canvas, "--color-agents-ink");
  const kome = resolveColor(canvas, "--color-kome");
  const faces: Array<[Rgb, Rgb]> = [
    [resolveColor(canvas, "--color-shiro"), ink],
    [resolveColor(canvas, "--color-frost"), ink],
    [resolveColor(canvas, "--brand-tenku-light"), ink],
    [resolveColor(canvas, "--color-tenku"), kome],
  ];
  return createShurikenWorld(
    tier,
    {
      sheets: faces.map(([face, printed]) => ({ face, ink: printed })),
      back: resolveColor(canvas, "--surface"),
      signal: resolveColor(canvas, "--color-fushimi"),
    },
    { marks, headings: marks.map((_, index) => finalHeading(index)) },
  );
}
