import "../src/styles/globals.css";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { OrigamiScene } from "../src/scene/origami-scene.tsx";
import { LIVE_TIMEOUT } from "../stories/support/live-timeout.ts";
import { canvasIn, canvasPixels, countPixels } from "./support/canvas-pixels.ts";
import { pause } from "./support/pause.ts";

/* Paper under the studio light: a pixel clearly brighter than the transparent ground. */
function lit(red: number, green: number, blue: number): boolean {
  return red + green + blue > 200;
}

function meanDifference(first: Uint8ClampedArray, second: Uint8ClampedArray): number {
  let sum = 0;
  for (let index = 0; index < first.length; index += 4) {
    sum += Math.abs((first[index] ?? 0) - (second[index] ?? 0));
  }
  return sum / (first.length / 4);
}

async function renderScene(progress: { value: number }) {
  const ready = vi.fn<() => void>();
  const screen = await render(
    <StrictMode>
      <div data-direction="origami" style={{ width: 320, height: 200, position: "relative" }}>
        <OrigamiScene tier="light" onReady={ready} progress={progress} />
      </div>
    </StrictMode>,
  );
  await expect.poll(() => ready.mock.calls.length, LIVE_TIMEOUT).toBeGreaterThan(0);
  return canvasIn(screen.container);
}

describe("Origami scene", () => {
  it("draws the sheet after StrictMode's double mount", async () => {
    const canvas = await renderScene({ value: 0 });

    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), lit), LIVE_TIMEOUT)
      .toBeGreaterThan(40);
  });

  it("keeps breathing at rest: two frames half a second apart differ", async () => {
    const canvas = await renderScene({ value: 0 });
    await pause(1800);
    const before = await canvasPixels(canvas);
    await pause(600);

    expect(meanDifference(before, await canvasPixels(canvas))).toBeGreaterThan(0.5);
  });

  it("follows the page's progress: the camera travels to the box", async () => {
    const progress = { value: 0 };
    const canvas = await renderScene(progress);
    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), lit), LIVE_TIMEOUT)
      .toBeGreaterThan(40);
    const sheet = await canvasPixels(canvas);

    progress.value = 0.7;

    await expect
      .poll(async () => meanDifference(sheet, await canvasPixels(canvas)), LIVE_TIMEOUT)
      .toBeGreaterThan(4);
  });
});
