import { PMREMGenerator, type WebGLRenderer, type WebGLRenderTarget } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import { resolveColor } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { createWorld, type OrigamiWorld } from "./origami-world.ts";

/* The studio in the direction's papers, read on the canvas so the theme's tokens apply. */
export function createWorldOn(canvas: HTMLCanvasElement, tier: QualityTier): OrigamiWorld {
  return createWorld(
    tier,
    {
      paper: resolveColor(canvas, "--origami-paper"),
      ivory: resolveColor(canvas, "--origami-ivory"),
      signal: resolveColor(canvas, "--origami-signal"),
      cobalt: resolveColor(canvas, "--origami-cobalt"),
      ink: resolveColor(canvas, "--origami-ink"),
    },
    getComputedStyle(canvas).fontFamily,
  );
}

/* A soft light box, prefiltered once: matte paper takes the room's light from every side. */
export function createStudio(renderer: WebGLRenderer): WebGLRenderTarget {
  const generator = new PMREMGenerator(renderer);
  const target = generator.fromScene(new RoomEnvironment(), 0.06);
  generator.dispose();
  return target;
}

export function disposeStudio(target: WebGLRenderTarget): void {
  target.dispose();
}
