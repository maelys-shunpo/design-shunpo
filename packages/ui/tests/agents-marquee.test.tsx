import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Marquee } from "../src/agents/marquee.tsx";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

afterEach(async () => {
  await allowMotion();
});

function viewportOf(container: HTMLElement): HTMLElement {
  const viewport = container.querySelector<HTMLElement>("[data-slot=marquee]");
  if (viewport === null) {
    throw new Error("No marquee rendered");
  }
  return viewport;
}

function repeatedCopyOf(container: HTMLElement): HTMLElement {
  const copy = container.querySelector<HTMLElement>("[data-slot=marquee] [aria-hidden]");
  if (copy === null) {
    throw new Error("No repeated copy rendered");
  }
  return copy;
}

describe("Marquee", () => {
  it("sizes a vertical marquee to the drift window, never taller than the screen allows", async () => {
    const screen = await render(
      <Marquee direction="up" extent="window">
        <span>Un</span>
      </Marquee>,
    );
    const viewport = viewportOf(screen.container);
    expect(viewport.classList.contains("aspect-2/5")).toBe(false);
    const { height } = viewport.getBoundingClientRect();
    expect(height).toBeGreaterThan(0);
    /* 42.5rem at most, and the screen less 13rem for the nav and the section's air. */
    expect(height).toBeLessThanOrEqual(Math.min(680, window.innerHeight - 208));
  });

  it("unfolds every item once under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(
      <Marquee direction="up" extent="window" still="unfold">
        <span>Un</span>
        <span>Deux</span>
        <span>Trois</span>
      </Marquee>,
    );
    const viewport = viewportOf(screen.container);
    expect(getComputedStyle(repeatedCopyOf(screen.container)).display).toBe("none");
    expect(getComputedStyle(viewport).maskImage).toBe("none");
    expect(viewport.scrollHeight).toBe(viewport.clientHeight);
  });

  it("unfolds a row under reduced motion, stacking every item with no clip", async () => {
    await preferReducedMotion();
    const screen = await render(
      <Marquee direction="left" still="unfold">
        <span>Un</span>
        <span>Deux</span>
        <span>Trois</span>
      </Marquee>,
    );
    const viewport = viewportOf(screen.container);
    expect(getComputedStyle(viewport).maskImage).toBe("none");
    expect(viewport.scrollWidth).toBe(viewport.clientWidth);
    expect(getComputedStyle(repeatedCopyOf(screen.container)).display).toBe("none");
  });

  it("keeps clipping by default under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(
      <Marquee direction="up">
        <span>Un</span>
      </Marquee>,
    );
    expect(getComputedStyle(repeatedCopyOf(screen.container)).display).not.toBe("none");
  });
});
