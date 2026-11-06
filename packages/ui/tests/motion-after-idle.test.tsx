import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { MotionProvider } from "../src/motion/motion-provider.tsx";
import { ScrollScene } from "../src/motion/scroll-scene.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { DESKTOP } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(() => {
  vi.restoreAllMocks();
  window.scrollTo(0, 0);
});

/* GSAP and Lenis are lazy: the first paint and hydration wait for none of them. */
describe("Motion once the page is idle", () => {
  it("starts smooth scrolling only once the page is idle", async () => {
    const screen = await render(
      <MotionProvider>
        <p>Painted page</p>
      </MotionProvider>,
    );

    await expect.element(screen.getByText("Painted page")).toBeVisible();
    await pause(SETTLE_MS);
    expect(document.documentElement).not.toHaveClass("lenis");

    releaseIdleCallbacks();
    await expect.element(document.documentElement).toHaveClass("lenis");
  });

  it("builds a scroll scene's choreography only once the page is idle", async () => {
    const choreography = vi.fn<(timeline: gsap.core.Timeline) => void>();
    const screen = await render(
      <ScrollScene choreography={choreography}>
        <p>Painted scene</p>
      </ScrollScene>,
    );

    await expect.element(screen.getByText("Painted scene")).toBeVisible();
    await pause(SETTLE_MS);
    expect(choreography).not.toHaveBeenCalled();

    releaseIdleCallbacks();
    await expect.poll(() => choreography.mock.calls.length).toBe(1);
  });
});
