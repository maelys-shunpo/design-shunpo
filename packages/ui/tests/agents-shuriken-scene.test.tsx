import "../src/styles/globals.css";
import { StrictMode } from "react";
import { siGmail, siGooglesheets, siHubspot, siOdoo } from "simple-icons";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { AgentsShurikenScene } from "../src/scene/agents-shuriken-scene.tsx";
import { LIVE_TIMEOUT } from "../stories/support/live-timeout.ts";
import { canvasIn, canvasPixels, countPixels } from "./support/canvas-pixels.ts";
import { pause } from "./support/pause.ts";

const MARKS = [siGmail, siHubspot, siOdoo, siGooglesheets].map(({ title, path }) => ({
  title,
  path,
}));

/* Coloured paper or its shadow over the Kome page: a pixel clearly darker than the page. */
function drawn(red: number, green: number, blue: number): boolean {
  return red + green + blue < 690;
}

/* The Fushimi pebble: a clearly red pixel. */
function fushimi(red: number, green: number, blue: number): boolean {
  return red > 120 && red > green * 1.6 && red > blue * 1.6;
}

function luminance(pixels: Uint8ClampedArray, index: number): number {
  return (
    0.2126 * (pixels[index] ?? 0) +
    0.7152 * (pixels[index + 1] ?? 0) +
    0.0722 * (pixels[index + 2] ?? 0)
  );
}

function meanDifference(first: Uint8ClampedArray, second: Uint8ClampedArray): number {
  let sum = 0;
  for (let index = 0; index < first.length; index += 4) {
    sum += Math.abs(luminance(first, index) - luminance(second, index));
  }
  return sum / (first.length / 4);
}

async function renderScene(progress: { value: number }) {
  const ready = vi.fn<() => void>();
  const screen = await render(
    <StrictMode>
      <div data-direction="agents" style={{ width: 320, height: 320, position: "relative" }}>
        <AgentsShurikenScene tier="light" onReady={ready} progress={progress} marks={MARKS} />
      </div>
    </StrictMode>,
  );
  await expect.poll(() => ready.mock.calls.length, LIVE_TIMEOUT).toBeGreaterThan(0);
  const canvas = canvasIn(screen.container);
  await expect
    .poll(async () => countPixels(await canvasPixels(canvas), drawn), LIVE_TIMEOUT)
    .toBeGreaterThan(40);
  return canvas;
}

describe("The folded sign scene", () => {
  it("lays the four sheets on the first frame, with no pebble yet", async () => {
    const canvas = await renderScene({ value: 0 });

    expect(countPixels(await canvasPixels(canvas), fushimi)).toBe(0);
  });

  it("keeps breathing at rest: two frames a second apart differ", async () => {
    const canvas = await renderScene({ value: 0 });
    await pause(1800);
    const before = await canvasPixels(canvas);
    await pause(1000);

    expect(meanDifference(before, await canvasPixels(canvas))).toBeGreaterThan(0.5);
  });

  it("ends on the SHUNPO badge: the sign on its Fushimi pebble, seen from above", async () => {
    const progress = { value: 0 };
    const canvas = await renderScene(progress);

    progress.value = 1;

    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), fushimi), LIVE_TIMEOUT)
      .toBeGreaterThan(150);
  });
});
