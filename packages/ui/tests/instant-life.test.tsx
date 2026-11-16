import "../src/styles/globals.css";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { InstantScene } from "../src/scene/instant-scene.tsx";
import { canvasIn, canvasPixels } from "./support/canvas-pixels.ts";

/* The motion audit's threshold (ADR-0026): an ambient canvas whose mean luminance changes by less than 0.5 over
   500 ms is frozen. */
const FROZEN_DIFFERENCE = 0.5;
/* This grid is finer and the canvas smaller than the audit's 32 by 32 over a full window, so it reads about three
   times more change for the same motion (measured: 0.32 here for the 0.11 the audit saw before life at rest). */
const GRID_SENSITIVITY = 3;
const AMBIENT_INTERVAL_MS = 500;
/* Life at rest grows over the first second and a half after the first frame. */
const GROWN_MS = 2000;

function luminance(pixels: Uint8ClampedArray): number[] {
  return Array.from({ length: pixels.length / 4 }, (_, index) => {
    const [red = 0, green = 0, blue = 0] = pixels.subarray(index * 4, index * 4 + 3);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  });
}

function meanDifference(first: number[], second: number[]): number {
  return (
    first.reduce((sum, value, index) => sum + Math.abs(value - Number(second[index])), 0) /
    first.length
  );
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

describe("Instant scene at rest", () => {
  it.each([
    ["the full week", 0],
    ["the linked system", 2 / 3],
    ["the freed week", 1],
  ])("keeps %s visibly alive over 500 ms", async (_state, at) => {
    const progress = { value: at };
    const ready = vi.fn<() => void>();
    const screen = await render(
      <div style={{ width: 480, height: 300, position: "relative", background: "#e5dfd3" }}>
        <InstantScene tier="full" onReady={ready} progress={progress} />
      </div>,
    );
    await expect.poll(() => ready.mock.calls.length, { timeout: 15_000 }).toBe(1);
    await wait(GROWN_MS);
    const canvas = canvasIn(screen.container);

    const first = luminance(await canvasPixels(canvas));
    await wait(AMBIENT_INTERVAL_MS);
    const second = luminance(await canvasPixels(canvas));

    expect(meanDifference(first, second)).toBeGreaterThanOrEqual(
      FROZEN_DIFFERENCE * GRID_SENSITIVITY,
    );
  });
});
