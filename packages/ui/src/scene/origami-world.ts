import {
  Color,
  type DataTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  type LineBasicMaterial,
  type MeshStandardMaterial,
  Vector3,
} from "three";

import type { Rgb } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { STATIONS } from "./origami-camera.ts";
import { setFold } from "./origami-folds.ts";
import { createGround, type Ground } from "./origami-ground.ts";
import { createCreases, createPaper, createPaperGrain } from "./origami-paper.ts";
import { cranePattern, planePattern } from "./origami-patterns-air.ts";
import { boatPattern, masuPattern } from "./origami-patterns-ground.ts";
import { bakePiece, createPiece, disposePiece, type Piece } from "./origami-piece.ts";

export interface OrigamiPalette {
  ivory: Rgb;
  citron: Rgb;
  cobalt: Rgb;
  white: Rgb;
}

export interface OrigamiWorld {
  root: Group;
  plane: Piece;
  crane: Piece;
  masu: Piece;
  boat: Piece;
  flock: InstancedMesh;
  key: DirectionalLight;
  rim: DirectionalLight;
  ground: Ground;
  /* The direction toward the rim light in view space: the papers glow where it shines through them. */
  backlight: { value: Vector3 };
  materials: MeshStandardMaterial[];
  creases: LineBasicMaterial;
  grain: DataTexture;
  /* The scene's own time: the sum of the frames' deltas, so a pause holds it. */
  clock: { time: number };
}

/* A flock big enough to read as a crowd, small enough for a phone. */
export const FLOCK: Record<QualityTier, number> = { light: 9, full: 16 };

function colour([red, green, blue]: Rgb): Color {
  return new Color().setRGB(red / 255, green / 255, blue / 255, "srgb");
}

function placed(piece: Piece, [x, y, z]: readonly [number, number, number]): Piece {
  piece.root.position.set(x, y, z);
  return piece;
}

/* Sculpted light: a warm key that grazes the paper so every facet takes its own value, a cool rim that cuts
   the edges and shines through the thin paper, and a fill kept very low. The key casts soft shadows on the
   full tier only. */
function createLights(tier: QualityTier): {
  key: DirectionalLight;
  rim: DirectionalLight;
  fill: HemisphereLight;
} {
  const key = new DirectionalLight(new Color(1, 0.86, 0.68), 3.6);
  const rim = new DirectionalLight(new Color(0.6, 0.72, 1), 2.8);
  const fill = new HemisphereLight(new Color(0.42, 0.44, 0.52), new Color(0.07, 0.06, 0.05), 0.35);
  if (tier === "full") {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, {
      left: -3,
      right: 3,
      top: 3,
      bottom: -3,
      near: 0.5,
      far: 14,
    });
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 4;
  }
  return { key, rim, fill };
}

interface Sheet {
  front: Rgb;
  back: Rgb;
}

interface PaperInputs {
  grain: DataTexture;
  tier: QualityTier;
  backlight: { value: Vector3 };
}

function paperOf(sheet: Sheet, { grain, tier, backlight }: PaperInputs): MeshStandardMaterial {
  return createPaper(
    { front: colour(sheet.front), back: colour(sheet.back), backlight },
    grain,
    tier,
  );
}

/* The studio: four pieces at their stations, each in its own paper (the box coloured outside, white inside),
   a flock of planes, and the lights. */
export function createWorld(tier: QualityTier, palette: OrigamiPalette): OrigamiWorld {
  const grain = createPaperGrain();
  const creases = createCreases();
  const backlight = { value: new Vector3(0, 0, -1) };
  const inputs = { grain, tier, backlight };
  const ivory = paperOf({ front: palette.ivory, back: palette.white }, inputs);
  const citron = paperOf({ front: palette.citron, back: palette.white }, inputs);
  const cobalt = paperOf({ front: palette.white, back: palette.cobalt }, inputs);
  const root = new Group();
  const plane = placed(createPiece(planePattern, ivory, creases), STATIONS.sheet);
  const crane = placed(createPiece(cranePattern, citron, creases), STATIONS.crane);
  const masu = placed(createPiece(masuPattern, cobalt, creases), STATIONS.masu);
  const boat = placed(createPiece(boatPattern, ivory, creases), STATIONS.boat);
  const flock = new InstancedMesh(bakePiece(planePattern, 1), ivory, FLOCK[tier]);
  /* Its bounds would be measured once, while every plane is still folded away: never cull it. */
  flock.frustumCulled = false;
  const { key, rim, fill } = createLights(tier);
  const ground = createGround(Object.values(STATIONS), tier);
  root.add(
    ground.root,
    plane.root,
    crane.root,
    masu.root,
    boat.root,
    flock,
    key,
    key.target,
    rim,
    rim.target,
    fill,
  );
  return {
    root,
    plane,
    crane,
    masu,
    boat,
    flock,
    key,
    rim,
    ground,
    backlight,
    materials: [ivory, citron, cobalt],
    creases,
    grain,
    clock: { time: 0 },
  };
}

export function disposeWorld(world: OrigamiWorld): void {
  for (const piece of [world.plane, world.crane, world.masu, world.boat]) {
    disposePiece(piece);
  }
  world.flock.geometry.dispose();
  world.flock.dispose();
  for (const material of world.materials) {
    material.dispose();
  }
  world.creases.dispose();
  world.grain.dispose();
  world.ground.dispose();
  world.key.shadow.dispose();
}

export function setFolds(
  world: OrigamiWorld,
  folds: Record<"plane" | "crane" | "masu" | "boat", number>,
  flutter: number,
): void {
  const breath = { flutter, rest: 0.05 };
  setFold(world.plane.facets, folds.plane, breath);
  setFold(world.crane.facets, folds.crane, breath);
  setFold(world.masu.facets, folds.masu, breath);
  setFold(world.boat.facets, folds.boat, breath);
}
