import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import {
  currentOf,
  dotsOf,
  dotY,
  dropLook,
  holdAt,
  inkBottom,
  inkOf,
  inkShift,
  landedOf,
  lengthenCopy,
  paintedBottom,
  restY,
  revealOf,
  watchCopyObservers,
  wheel,
} from "./support/method-wheel.tsx";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion } from "./support/reduced-motion.ts";
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

/* The method's one stroke: the brush paints down to its tip, the page follows the tip, each drop lands as the tip
   reaches it. */
describe("MethodWheel's stroke", () => {
  it("lands no drop before the stroke reaches it", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0);
    await expect
      .poll(() => landedOf(screen.container), { timeout: 5000 })
      .toEqual([false, false, false]);

    await holdAt(0.6);
    await expect
      .poll(() => landedOf(screen.container), { timeout: 5000 })
      .toEqual([true, true, false]);

    await holdAt(1);
    await expect
      .poll(() => landedOf(screen.container), { timeout: 5000 })
      .toEqual([true, true, true]);
  });

  it("keeps the passed drops on the ink, moving up with it", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(1);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Évolution");
    const [first, , last] = dotsOf(screen.container);

    expect(first?.dataset["passed"]).toBe("");
    /* Clearly wider than the stroke (18 px, pressed to about 24), or it reads as a knot in the ink it sits on. */
    await expect.poll(() => dropLook(first).height).toBeGreaterThan(30);
    expect(dropLook(last).height / dropLook(first).height).toBeGreaterThan(1.4);
    expect(dropLook(first).opacity).toBe("1");
    expect(dotY(first)).toBeLessThan(dotY(last));
  });

  it("lifts the ink by a step's pitch per phase, the tip held at the rest point", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.2);
    await expect.poll(() => inkOf(screen.container), { timeout: 5000 }).not.toBe("");
    expect(inkShift(screen.container)).toBe(0);
    expect(dotY(dotsOf(screen.container)[0])).toBeCloseTo(restY(screen.container), 0);

    await holdAt(0.6);
    const oneStep = inkShift(screen.container);
    expect(oneStep).toBeLessThan(0);

    await holdAt(1);
    expect(Math.abs(inkShift(screen.container) / oneStep - 2)).toBeLessThan(0.05);
    expect(Math.abs(dotY(dotsOf(screen.container)[2]) - restY(screen.container))).toBeLessThan(2);
  });

  it("paints the state of wherever the scroll lands, forwards or back", async () => {
    const back = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(1);
    await holdAt(0.4);
    const travelled = {
      landed: landedOf(back.container),
      shift: inkShift(back.container),
      reveal: revealOf(back.container),
    };
    await back.unmount();
    window.scrollTo(0, 0);

    const straight = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.4);
    await expect.poll(() => inkOf(straight.container), { timeout: 5000 }).not.toBe("");

    expect(landedOf(straight.container)).toEqual(travelled.landed);
    expect(Math.abs(inkShift(straight.container) - travelled.shift)).toBeLessThan(1);
    expect(Math.abs(revealOf(straight.container) - travelled.reveal)).toBeLessThan(0.001);
  });

  it("repaints the stroke for a new stage size and keeps the tip on the rest point", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Construction");
    const before = inkOf(screen.container);
    expect(Math.abs(dotY(dotsOf(screen.container)[1]) - restY(screen.container))).toBeLessThan(2);

    await page.viewport(1440, 900);
    await holdAt(0.6);

    await expect.poll(() => inkOf(screen.container), { timeout: 5000 }).not.toBe(before);
    expect(Math.abs(dotY(dotsOf(screen.container)[1]) - restY(screen.container))).toBeLessThan(2);
  });

  it("marks the last drop the brush has reached as the current one, never none", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    /* Construction is being named, its drop not reached yet. */
    await holdAt(0.5);
    await expect.poll(() => inkOf(screen.container), { timeout: 5000 }).not.toBe("");
    const [first, second] = dotsOf(screen.container);

    expect(second?.dataset["landed"]).toBeUndefined();
    expect(first?.dataset["active"]).toBe("");
  });

  it("paints the whole stroke down to the last drop on a short screen with a long copy", async () => {
    await page.viewport(1024, 600);
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    lengthenCopy(screen.container, 2);
    await pause(SETTLE_MS);
    await holdAt(0.58);
    await holdAt(0.6);

    expect(paintedBottom(screen.container)).toBeGreaterThanOrEqual(inkBottom(screen.container));
  });

  it("lets go of the copies when it is held again, so observers never pile up", async () => {
    const observers = watchCopyObservers();
    try {
      await render(wheel());
      releaseIdleCallbacks();
      await holdAt(0.6);
      await page.viewport(PHONE.width, PHONE.height);
      await pause(SETTLE_MS);
      await page.viewport(DESKTOP.width, DESKTOP.height);
      await holdAt(0.6);

      expect(observers.live()).toBe(1);
    } finally {
      observers.restore();
    }
  });
});
