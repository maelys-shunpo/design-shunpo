import { PMREMGenerator, type WebGLRenderer, type WebGLRenderTarget } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { resolveColor, type Rgb } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { type Calibre, createCalibre } from "./mecanique-calibre.ts";

/* Brass is Shiro warmed toward gold: the palette keeps its four colours, the metal still reads as brass. */
export function warm([red, green, blue]: Rgb): Rgb {
  return [red, Math.round(green * 0.88), Math.round(blue * 0.66)];
}

/* The calibre in the theme's brand colours, read on the canvas so the direction's tokens apply. */
export function createCalibreOn(canvas: HTMLCanvasElement, tier: QualityTier): Calibre {
  return createCalibre(tier, {
    steel: resolveColor(canvas, "--brand-frost"),
    brass: warm(resolveColor(canvas, "--brand-shiro")),
    plate: resolveColor(canvas, "--brand-fuji-raised"),
    ruby: resolveColor(canvas, "--brand-fushimi"),
    dial: resolveColor(canvas, "--brand-kome"),
    ink: resolveColor(canvas, "--brand-fuji"),
    blued: resolveColor(canvas, "--brand-tenku-light"),
  });
}

/* A studio light box, prefiltered once: the metals need something to reflect. The room itself is only the source of
   the prefiltered map: its geometries and materials go back to the GPU as soon as it is read. */
export function createEnvironment(renderer: WebGLRenderer): WebGLRenderTarget {
  const generator = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const target = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  return target;
}

export function disposeEnvironment(target: WebGLRenderTarget): void {
  target.dispose();
}
