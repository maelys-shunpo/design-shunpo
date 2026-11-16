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

  it("holds a scene under the header and hands a seek that scrolls to a point of it", async () => {
    const onSeek = vi.fn<(seek: ((progress: number) => void) | null) => void>();
    const screen = await render(
      <ScrollScene
        choreography={vi.fn<(timeline: gsap.core.Timeline) => void>()}
        below="header"
        onSeek={onSeek}
      >
        <p>Held scene</p>
      </ScrollScene>,
    );
    const stage = screen.getByText("Held scene").element().parentElement;
    expect(stage).toHaveClass("motion-safe:top-header");

    releaseIdleCallbacks();
    await expect.poll(() => onSeek.mock.calls.length).toBe(1);
    const seek = onSeek.mock.calls[0]?.[0];
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(vi.fn<() => void>());
    seek?.(0.5);
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));

    await screen.unmount();
    expect(onSeek).toHaveBeenLastCalledWith(null);
  });
});
