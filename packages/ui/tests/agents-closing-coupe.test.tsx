import "../src/styles/globals.css";
import { gsap } from "gsap";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { ClosingCoupe } from "../src/agents/closing-coupe.tsx";
import { coupeChoreography } from "../src/agents/coupe-choreography.ts";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

const copy = (
  <div>
    <h2>Le dernier logiciel dont vous aurez besoin</h2>
    <a href="#parler">Parlons de votre projet</a>
  </div>
);

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  releaseIdleCallbacks();
  await allowMotion();
});

describe("ClosingCoupe", () => {
  it("shows the closing call on the night the coupe uncovers", async () => {
    const screen = await render(<ClosingCoupe>{copy}</ClosingCoupe>);

    await expect.element(screen.getByRole("heading", { level: 2 })).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "Parlons de votre projet" }))
      .toBeVisible();
  });

  it("reads the night and its call directly on phones, with no cut to play", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(<ClosingCoupe>{copy}</ClosingCoupe>);

    await expect.element(screen.getByRole("heading", { level: 2 })).toBeVisible();
    expect(screen.container.querySelector("[data-slot=stage] canvas")).toBeNull();
  });

  it("shows the whole closing under reduced motion, with no stage", async () => {
    await preferReducedMotion();
    const screen = await render(<ClosingCoupe>{copy}</ClosingCoupe>);

    await expect.element(screen.getByRole("heading", { level: 2 })).toBeVisible();
    expect(screen.container.querySelector("[data-slot=stage] canvas")).toBeNull();
  });

  it("runs the cut's progress with the scroll", () => {
    const progress = { value: 0 };
    const timeline = gsap.timeline({ paused: true });
    coupeChoreography(progress)(timeline);

    timeline.progress(0.5);
    expect(progress.value).toBeCloseTo(0.5, 6);

    timeline.progress(1);
    expect(progress.value).toBe(1);
    timeline.kill();
  });
});
