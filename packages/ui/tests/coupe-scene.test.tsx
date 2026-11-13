import "../src/styles/globals.css";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { CoupeScene } from "../src/scene/coupe-scene.tsx";
import { LIVE_TIMEOUT } from "../stories/support/live-timeout.ts";
import { canvasIn, canvasPixels, countPixels } from "./support/canvas-pixels.ts";

/* The printed face over the night: a clearly light pixel that is not the red star. */
function paper(red: number, green: number, blue: number): boolean {
  return red + green + blue > 540 && !(red > green * 1.4 && red > blue * 1.4);
}

/* The Fuji Night behind, uncovered as the halves fall away: a clearly dark pixel. */
function night(red: number, green: number, blue: number): boolean {
  return red + green + blue < 180;
}

/* The Fushimi shuriken in flight: a red-dominant pixel, even once the thin star averages with the paper on the grid. */
function fushimi(red: number, green: number, blue: number): boolean {
  return red > 120 && red > green + 25 && red > blue + 30;
}

async function renderScene(progress: { value: number }) {
  const ready = vi.fn<() => void>();
  const screen = await render(
    <StrictMode>
      <div
        data-direction="agents"
        style={{ width: 320, height: 320, position: "relative", background: "#1e2629" }}
      >
        <CoupeScene tier="light" onReady={ready} progress={progress} />
      </div>
    </StrictMode>,
  );
  await expect.poll(() => ready.mock.calls.length, LIVE_TIMEOUT).toBeGreaterThan(0);
  const canvas = canvasIn(screen.container);
  await expect
    .poll(async () => countPixels(await canvasPixels(canvas), paper), LIVE_TIMEOUT)
    .toBeGreaterThan(400);
  return canvas;
}

describe("The coupe scene", () => {
  it("lays the whole page as paper on the first frame, with no star yet", async () => {
    const canvas = await renderScene({ value: 0 });

    expect(countPixels(await canvasPixels(canvas), fushimi)).toBe(0);
  });

  it("throws the Fushimi star across the page", async () => {
    const progress = { value: 0 };
    const canvas = await renderScene(progress);

    progress.value = 0.25;

    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), fushimi), LIVE_TIMEOUT)
      .toBeGreaterThan(0);
  });

  it("never takes the pointer, so the call waiting in the DOM behind it stays clickable", async () => {
    const canvas = await renderScene({ value: 0 });

    expect(getComputedStyle(canvas).pointerEvents).toBe("none");
  });

  it("falls apart to uncover the night, the star gone with the gesture", async () => {
    const progress = { value: 0 };
    const canvas = await renderScene(progress);

    progress.value = 1;

    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), night), LIVE_TIMEOUT)
      .toBeGreaterThan(400);
    expect(countPixels(await canvasPixels(canvas), fushimi)).toBe(0);
  });
});
