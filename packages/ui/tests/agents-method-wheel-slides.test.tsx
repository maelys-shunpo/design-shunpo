import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { currentOf, holdAt, inkOf, slidesOf, wheel } from "./support/method-wheel.tsx";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

const SWEEP = [0.4, 0.44, 0.48, 0.52, 0.56, 0.6];

function kanjiShiftOf(container: HTMLElement, phase: number): number {
  const kanji = container.querySelectorAll<HTMLElement>("[data-slot=wheel-step] [lang=ja]")[phase];
  return kanji === undefined ? Number.NaN : new DOMMatrix(getComputedStyle(kanji).transform).f;
}

/* How present Immersion and Construction are together, at each share of the sweep, scrolled in turn. */
function crossingSums(container: HTMLElement): Promise<number[]> {
  return SWEEP.reduce<Promise<number[]>>(async (previous, share) => {
    const sums = await previous;
    await holdAt(share);
    const [immersion, construction] = slidesOf(container);
    return [...sums, (immersion?.presence ?? 0) + (construction?.presence ?? 0)];
  }, Promise.resolve([]));
}

function shiftOf(container: HTMLElement, phase: number): number {
  return slidesOf(container)[phase]?.shift ?? Number.NaN;
}

function pendingOf(container: HTMLElement, phase: number): boolean[] {
  const step = container.querySelectorAll("[data-slot=wheel-step]")[phase];
  return [...(step?.querySelectorAll<HTMLElement>("[data-wheel-deliverable]") ?? [])].map((row) =>
    Object.hasOwn(row.dataset, "pending"),
  );
}

function presenceOf(container: HTMLElement, phase: number): number {
  return slidesOf(container)[phase]?.presence ?? Number.NaN;
}

function kanjiOpacityOf(container: HTMLElement, phase: number): number {
  const kanji = container.querySelectorAll("[data-slot=wheel-step] [lang=ja]")[phase];
  return kanji === undefined ? Number.NaN : Number(getComputedStyle(kanji).opacity);
}

function copyHeightOf(container: HTMLElement, phase: number): number {
  return container.querySelectorAll<HTMLElement>("[data-wheel-copy]")[phase]?.offsetHeight ?? 0;
}

/* The phases' copy slides like a page: up with the ink as the scroll goes on, fading out above and in from below. */
describe("MethodWheel's phases", () => {
  it("moves the phases up with the ink: the one before gone up, the current in place, the next below", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Construction");
    const [before, current, next] = slidesOf(screen.container);

    expect(current?.shift).toBeCloseTo(0);
    expect(current?.presence).toBeCloseTo(1);
    expect(before?.shift).toBeLessThan(0);
    expect(before?.presence).toBe(0);
    expect(next?.shift).toBeGreaterThan(0);
    expect(next?.presence).toBe(0);
  });

  it("brings Immersion's copy up from below as its drop lands", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.25);
    await expect.poll(() => inkOf(screen.container), { timeout: 5000 }).not.toBe("");
    const [landing] = slidesOf(screen.container);

    expect(landing?.presence).toBeGreaterThan(0);
    expect(landing?.presence).toBeLessThan(1);
    expect(landing?.shift).toBeGreaterThan(0);
    expect(landing?.shift).toBeLessThanOrEqual(96);

    await holdAt(0.3);
    const [landed] = slidesOf(screen.container);
    expect(landed?.presence).toBe(1);
    expect(landed?.shift).toBeCloseTo(0);
  });

  it("crosses two copies mid-way, so there is always something to read", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    const sums = await crossingSums(screen.container);

    expect(Math.min(...sums)).toBeGreaterThanOrEqual(0.6);
  });

  it("moves the kanji at six tenths of its copy's pace", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Construction");

    expect(kanjiShiftOf(screen.container, 0)).toBeCloseTo(0.6 * shiftOf(screen.container, 0), 0);
  });

  it("keeps the pitch on the tallest copy once its text grows", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Construction");
    const text = screen.container.querySelectorAll("[data-wheel-copy] p")[2];
    text?.replaceChildren(
      "On suit les usages, on ajuste les seuils et on ajoute des flux. ".repeat(30),
    );
    await pause(SETTLE_MS);
    await holdAt(0.58);
    await holdAt(0.6);
    const [, , next] = slidesOf(screen.container);

    expect(next?.shift).toBeGreaterThanOrEqual(copyHeightOf(screen.container, 2) + 96);
  });

  it("keeps a coming phase's deliverables unticked until it is named", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    /* Construction comes up, half present, Immersion still named. */
    await holdAt(0.46);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Immersion");

    expect(pendingOf(screen.container, 1)).toEqual([true, true]);
    expect(pendingOf(screen.container, 2)).toEqual([true]);
  });

  it("fades the kanji faster than its copy, so two kanji never stack mid-way", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.46);
    const presence = presenceOf(screen.container, 1);

    expect(presence).toBeGreaterThan(0.3);
    expect(kanjiOpacityOf(screen.container, 1)).toBeLessThanOrEqual(presence ** 3 + 0.02);
  });
});
