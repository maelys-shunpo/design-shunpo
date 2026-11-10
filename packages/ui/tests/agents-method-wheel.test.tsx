import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { currentOf, holdAt, inkOf, wheel } from "./support/method-wheel.tsx";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

/* A film of twelve frames, each a square of its own grey: Immersion comes in over 6 to 8, rests on 2 and loops over 0
   to 2; Construction rests on 5; Évolution rests on 11 and loops over 9 to 11. */
async function testFilm() {
  const frames = await Promise.all(
    Array.from({ length: 12 }, async (_, index) => {
      const canvas = new OffscreenCanvas(32, 32);
      const context = canvas.getContext("2d");
      if (context !== null) {
        context.fillStyle = `rgb(${String(index * 20)} ${String(index * 20)} ${String(index * 20)})`;
        context.fillRect(0, 0, 32, 32);
      }
      return URL.createObjectURL(await canvas.convertToBlob());
    }),
  );
  return {
    frames,
    rests: [
      {
        pose: 2,
        entrance: { from: 6, to: 8, seconds: 1.5 },
        loop: { from: 0, to: 2, seconds: 1, hold: 0.2, delay: 0, motion: "repeat" as const },
      },
      { pose: 5 },
      {
        pose: 11,
        loop: { from: 9, to: 11, seconds: 1, hold: 0.2, delay: 0, motion: "repeat" as const },
      },
    ],
    labels: { pause: "Pause", play: "Lecture" },
  };
}

function filmOf(container: HTMLElement) {
  return container.querySelector<HTMLCanvasElement>("canvas[data-wheel-film]");
}

/* The grey at the centre of the film: each test frame has its own. */
function centreGrey(container: HTMLElement): number {
  const film = filmOf(container);
  const pixel = film?.getContext("2d")?.getImageData(film.width / 2, film.height / 2, 1, 1).data;
  return pixel?.[0] ?? -1;
}

describe("MethodWheel", () => {
  it("asks the question, then reads every phase with its deliverables and its board", async () => {
    const screen = await render(wheel());
    await expect
      .element(screen.getByRole("heading", { level: 2, name: /commence par une Immersion/u }))
      .toBeInTheDocument();
    expect(screen.container.querySelectorAll("h3")).toHaveLength(3);
    expect(screen.container.querySelectorAll("[data-wheel-deliverable]")).toHaveLength(6);
    await expect.element(screen.getByText("Flux en production")).toBeInTheDocument();
    expect(screen.container.querySelectorAll("[data-wheel-dot]")).toHaveLength(3);
  });

  it("paints the stroke once idle, then names a phase, frames it and ticks its deliverables", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await expect
      .poll(() => inkOf(screen.container), { timeout: 5000 })
      .toMatch(/^data:image\/svg\+xml,/u);
    expect(currentOf(screen.container)).toBe("");

    await holdAt(0.6);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Construction");
    const current = screen.container.querySelector("[data-wheel-active] [data-wheel-copy]");
    expect(current?.getAttribute("aria-current")).toBe("step");

    await holdAt(1);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Évolution");
    expect(screen.container.querySelectorAll("[data-wheel-active] [data-pending]")).toHaveLength(0);
  });

  it("keeps every phase's title on the same line, however long its copy", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    await expect
      .poll(
        () =>
          new Set(
            [...screen.container.querySelectorAll<HTMLElement>("h3")].map((title) =>
              Math.round(title.offsetTop),
            ),
          ).size,
        {
          timeout: 5000,
        },
      )
      .toBe(1);
  });

  it("draws the paper film over the stills once a phase is named, from tablets up", async () => {
    const screen = await render(wheel(await testFilm()));
    releaseIdleCallbacks();
    await holdAt(0.6);
    await expect.poll(() => filmOf(screen.container), { timeout: 5000 }).not.toBeNull();
    await expect
      .poll(() => screen.container.querySelector("[data-slot=method-wheel][data-film-ready]"), {
        timeout: 5000,
      })
      .not.toBeNull();
    const film = filmOf(screen.container);
    const pixel = film?.getContext("2d")?.getImageData(film.width / 2, film.height / 2, 1, 1).data;
    expect(pixel?.[3]).toBe(255);
  });

  it("plays Immersion's entrance from the question, then loops it on its own until paused", async () => {
    const screen = await render(wheel(await testFilm()));
    releaseIdleCallbacks();
    await holdAt(0.3);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Immersion");
    /* The entrance's frames are the light greys (120 to 160), the loop's the dark ones (0 to 40). */
    await expect
      .poll(() => centreGrey(screen.container), { timeout: 5000, interval: 50 })
      .toBeGreaterThan(100);
    await expect
      .poll(() => centreGrey(screen.container), { timeout: 5000, interval: 50 })
      .toBeLessThan(60);
    const greys = new Set<number>();
    await expect
      .poll(
        () => {
          greys.add(centreGrey(screen.container));
          return greys.size;
        },
        { timeout: 5000, interval: 50 },
      )
      .toBeGreaterThan(2);

    await screen.getByRole("button", { name: "Pause" }).click();
    const held = centreGrey(screen.container);
    await pause(SETTLE_MS * 2);
    expect(centreGrey(screen.container)).toBe(held);
    await expect.element(screen.getByRole("button", { name: "Lecture" })).toBeInTheDocument();
  });

  it("never puts the film's canvas in under reduced motion or on phones", async () => {
    await preferReducedMotion();
    const film = await testFilm();
    const reduced = await render(wheel(film));
    releaseIdleCallbacks();
    await holdAt(0.6);
    expect(filmOf(reduced.container)).toBeNull();
    await reduced.unmount();

    await allowMotion();
    await page.viewport(PHONE.width, PHONE.height);
    const phone = await render(wheel(film));
    await pause(SETTLE_MS);
    expect(filmOf(phone.container)).toBeNull();
  });

  it("holds nothing under reduced motion: no stroke, no phase singled out", async () => {
    await preferReducedMotion();
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    expect(inkOf(screen.container)).toBe("");
    expect(currentOf(screen.container)).toBe("");
  });

  it("stacks the phases on phones, without the ink", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await pause(SETTLE_MS);
    const ink = screen.container.querySelector<SVGElement>("[data-slot=wheel-ink]");
    await expect.element(ink).not.toBeVisible();
    expect(currentOf(screen.container)).toBe("");
    await expect.element(screen.getByText("Carte des processus")).toBeVisible();
  });
});
