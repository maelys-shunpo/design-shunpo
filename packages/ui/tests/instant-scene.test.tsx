import "../src/styles/globals.css";
import { StrictMode } from "react";
import { OrthographicCamera, Points, Scene, WebGLRenderer } from "three";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import type { QualityTier } from "../src/lib/quality-tier.ts";
import { advance, createInk } from "../src/scene/instant-points.ts";
import { InstantScene } from "../src/scene/instant-scene.tsx";
import { canvasIn, canvasPixels, countPixels } from "./support/canvas-pixels.ts";

const SIZE = 96;
/* The motion audit's blank threshold (ADR-0026): luminance spread under 2 is an empty canvas. */
const BLANK_SPREAD = 2;
const LOOK = { ink: [30, 38, 41], seal: [185, 69, 50] } as const;

/* Draws one frame of the ink at a progress, failing on any compile or link error instead of logging it. */
function drawAt(tier: QualityTier, progress: number): Uint8Array {
  const renderer = new WebGLRenderer();
  renderer.setSize(SIZE, SIZE);
  renderer.setClearColor(0xffffff, 1);
  renderer.debug.onShaderError = (gl, ...[, vertexShader, fragmentShader]) => {
    const logs = [gl.getShaderInfoLog(fragmentShader), gl.getShaderInfoLog(vertexShader)];
    throw new Error(
      logs.filter((log) => log !== null && log !== "").join("\n") || "The shader did not link.",
    );
  };
  const ink = createInk(tier, 1, { ink: [...LOOK.ink], seal: [...LOOK.seal] });
  advance(ink.uniforms, { delta: 0.1, progress, width: SIZE, height: SIZE });
  const scene = new Scene();
  for (const material of ink.materials) {
    const points = new Points(ink.geometry, material);
    points.frustumCulled = false;
    scene.add(points);
  }
  renderer.render(scene, new OrthographicCamera());
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  const gl = renderer.getContext();
  gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  renderer.dispose();
  /* Release the context now: Chrome keeps 16 at most, and a later scene would lose its own. */
  renderer.forceContextLoss();
  return pixels;
}

function luminanceSpread(pixels: Uint8Array): number {
  const luminance = Array.from({ length: pixels.length / 4 }, (_, index) => {
    const offset = index * 4;
    return (
      0.2126 * (pixels[offset] ?? 0) +
      0.7152 * (pixels[offset + 1] ?? 0) +
      0.0722 * (pixels[offset + 2] ?? 0)
    );
  });
  const mean = luminance.reduce((sum, value) => sum + value, 0) / luminance.length;
  return Math.sqrt(
    luminance.reduce((sum, value) => sum + (value - mean) ** 2, 0) / luminance.length,
  );
}

function isRed(red: number, green: number, blue: number): boolean {
  return red > 120 && red > green + 50 && red > blue + 50;
}

function redPixels(pixels: Uint8Array): number {
  let count = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    const [red = 0, green = 0, blue = 0] = pixels.subarray(index, index + 3);
    count += red > 120 && red > green + 50 && red > blue + 50 ? 1 : 0;
  }
  return count;
}

describe("Instant ink shader", () => {
  it.each<QualityTier>(["light", "full"])(
    "compiles and draws ink that is not blank on the %s tier",
    (tier) => {
      expect(luminanceSpread(drawAt(tier, 0))).toBeGreaterThan(BLANK_SPREAD);
    },
  );

  it("holds the week in ink alone, then stamps the red seal once the last jump lands", () => {
    expect(redPixels(drawAt("full", 0))).toBe(0);
    expect(redPixels(drawAt("full", 1))).toBeGreaterThan(200);
  });
});

describe("Instant scene under StrictMode", () => {
  it("keeps following the scroll after the double mount of development", async () => {
    const progress = { value: 0 };
    const ready = vi.fn<() => void>();
    const screen = await render(
      <StrictMode>
        <div style={{ width: 240, height: 160, position: "relative" }}>
          <InstantScene tier="light" onReady={ready} progress={progress} />
        </div>
      </StrictMode>,
    );
    await expect.poll(() => ready.mock.calls.length, { timeout: 15_000 }).toBe(1);
    const canvas = canvasIn(screen.container);

    progress.value = 1;

    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), isRed), { timeout: 8000 })
      .toBeGreaterThan(20);
  });
});
