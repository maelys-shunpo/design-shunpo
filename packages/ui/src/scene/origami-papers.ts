import {
  type CanvasTexture,
  Color,
  type DataTexture,
  type LineBasicMaterial,
  type MeshStandardMaterial,
  Vector3,
} from "three";

import type { Rgb } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { createLabel, MODULES } from "./origami-cube.ts";
import { createCreases, createPaper, createPaperGrain } from "./origami-paper.ts";

export interface OrigamiPalette {
  paper: Rgb;
  ivory: Rgb;
  signal: Rgb;
  cobalt: Rgb;
  ink: Rgb;
}

export interface Papers {
  grain: DataTexture;
  creases: LineBasicMaterial;
  /* The direction toward the rim light in view space: the papers glow where it shines through them. */
  backlight: { value: Vector3 };
  ivory: MeshStandardMaterial;
  signal: MeshStandardMaterial;
  white: MeshStandardMaterial;
  cobalt: MeshStandardMaterial;
  units: MeshStandardMaterial[];
  labels: CanvasTexture[];
}

export function colour([red, green, blue]: Rgb): Color {
  return new Color().setRGB(red / 255, green / 255, blue / 255, "srgb");
}

interface Making {
  grain: DataTexture;
  tier: QualityTier;
  backlight: { value: Vector3 };
  back: Rgb;
}

function paperOf(front: Rgb, { grain, tier, backlight, back }: Making): MeshStandardMaterial {
  return createPaper({ front: colour(front), back: colour(back), backlight }, grain, tier);
}

/* Every paper of the studio, white on the back: ivory for the sheet, the one signal orange for the crane,
   cobalt for the launched plane, white for the flock, and six module units (white, cobalt, ivory, signal for the agent, white, ivory), each
   printed with its module's name. */
export function createPapers(tier: QualityTier, palette: OrigamiPalette, font: string): Papers {
  const making = {
    grain: createPaperGrain(),
    tier,
    backlight: { value: new Vector3(0, 0, -1) },
    back: palette.paper,
  };
  const labels = MODULES.map((name, index) => createLabel(name, index, font));
  const fronts = [
    palette.paper,
    palette.cobalt,
    palette.ivory,
    palette.signal,
    palette.paper,
    palette.ivory,
  ];
  return {
    grain: making.grain,
    creases: createCreases(),
    backlight: making.backlight,
    ivory: paperOf(palette.ivory, making),
    signal: paperOf(palette.signal, making),
    white: paperOf(palette.paper, making),
    cobalt: paperOf(palette.cobalt, making),
    units: fronts.map((front, index) =>
      Object.assign(paperOf(front, making), { map: labels[index] ?? null }),
    ),
    labels,
  };
}

export function disposePapers(papers: Papers): void {
  for (const material of [
    papers.ivory,
    papers.signal,
    papers.white,
    papers.cobalt,
    ...papers.units,
  ]) {
    material.dispose();
  }
  papers.creases.dispose();
  papers.grain.dispose();
}
