import { type DirectionalLight, Group, InstancedMesh } from "three";

import type { QualityTier } from "../lib/quality-tier.ts";
import { STATIONS } from "./origami-camera.ts";
import { createCube, type Cube, disposeCube } from "./origami-cube.ts";
import { createGround, createLights, type Ground } from "./origami-ground.ts";
import {
  colour,
  createPapers,
  disposePapers,
  type OrigamiPalette,
  type Papers,
} from "./origami-papers.ts";
import { cranePattern, planePattern } from "./origami-patterns-air.ts";
import { bakePiece, createPiece, disposePiece, type Piece } from "./origami-piece.ts";
import { createSheet, disposeSheet, type Sheet } from "./origami-sheet.ts";

export type { OrigamiPalette } from "./origami-papers.ts";

export interface OrigamiWorld {
  root: Group;
  sheet: Sheet;
  cube: Cube;
  crane: Piece;
  plane: Piece;
  flock: InstancedMesh;
  key: DirectionalLight;
  rim: DirectionalLight;
  ground: Ground;
  papers: Papers;
  /* The direction toward the rim light in view space, shared by every paper. */
  backlight: Papers["backlight"];
  /* The scene's own time: the sum of the frames' deltas, so a pause holds it. */
  clock: { time: number };
}

/* A flock big enough to read as a crowd, small enough for a phone. */
export const FLOCK: Record<QualityTier, number> = { light: 9, full: 16 };

function placed(piece: Piece, [x, y, z]: readonly [number, number, number]): Piece {
  piece.root.position.set(x, y, z);
  return piece;
}

/* The studio: the sheet and its crease pattern, the cube of modules, the crane, the plane, a flock and the
   lights, each piece at its station on a bright floor. */
export function createWorld(
  tier: QualityTier,
  palette: OrigamiPalette,
  font: string,
): OrigamiWorld {
  const papers = createPapers(tier, palette, font);
  const sheet = createSheet(papers.ivory, papers.creases, colour(palette.ink));
  placed(sheet.piece, STATIONS.atelier);
  const cube = createCube(papers.units, papers.creases, papers.labels);
  cube.root.position.set(STATIONS.modules[0], 0.62, STATIONS.modules[2]);
  const crane = placed(createPiece(cranePattern, papers.signal, papers.creases), STATIONS.crane);
  const plane = placed(createPiece(planePattern, papers.cobalt, papers.creases), STATIONS.launch);
  const flock = new InstancedMesh(bakePiece(planePattern, 1), papers.white, FLOCK[tier]);
  /* Its bounds would be measured once, while every plane is still folded away: never cull it. */
  flock.frustumCulled = false;
  const { key, rim, fill } = createLights(tier);
  const ground = createGround(Object.values(STATIONS), tier);
  const root = new Group();
  root.add(ground.root, sheet.piece.root, cube.root, crane.root, plane.root, flock);
  root.add(key, key.target, rim, rim.target, fill);
  return {
    root,
    sheet,
    cube,
    crane,
    plane,
    flock,
    key,
    rim,
    ground,
    papers,
    backlight: papers.backlight,
    clock: { time: 0 },
  };
}

export function disposeWorld(world: OrigamiWorld): void {
  disposeSheet(world.sheet);
  disposeCube(world.cube);
  disposePiece(world.crane);
  disposePiece(world.plane);
  world.flock.geometry.dispose();
  world.flock.dispose();
  disposePapers(world.papers);
  world.ground.dispose();
  world.key.shadow.dispose();
}
