import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { FilMotionRuntime } from "../src/fil/fil-motion-runtime.tsx";
import { FilMotionPage } from "./support/fil-motion-page.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

function one(container: HTMLElement, selector: string): HTMLElement | SVGElement {
  const element = container.querySelector<HTMLElement | SVGElement>(selector);
  if (element === null) {
    throw new Error(`Nothing matches ${selector}`);
  }
  return element;
}

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await allowMotion();
  window.scrollTo(0, 0);
});

describe("FilMotion", () => {
  it("prepares the thread, the strokes and the headlines below the window once the page is idle", async () => {
    const screen = await render(<FilMotionPage />);
    const thread = one(screen.container, "[data-fil-thread]");
    const strike = one(screen.container, "[data-fil-strike]");
    const headline = one(screen.container, "[data-fil-reveal]");
    expect(thread.style.strokeDasharray).toBe("");

    releaseIdleCallbacks();

    await expect.poll(() => thread.style.strokeDasharray).not.toBe("");
    await expect.poll(() => strike.style.transform).toContain("scale(0");
    await expect
      .poll(() => headline.getAttribute("aria-label"))
      .toBe("Ce que vous achetez vraiment.");
    expect(one(screen.container, "[data-fil-underline]").style.strokeDasharray).not.toBe("");
  });

  it("draws a stroke once it enters the window", async () => {
    const screen = await render(<FilMotionPage />);
    const strike = one(screen.container, "[data-fil-strike]");
    releaseIdleCallbacks();
    await expect.poll(() => strike.style.transform).toContain("scale(0");

    strike.scrollIntoView({ block: "center" });

    await expect.poll(() => strike.style.transform, { timeout: 5000 }).not.toContain("scale(0");
  });

  it("leaves the page as painted when motion is reduced", async () => {
    await preferReducedMotion();
    const screen = await render(<FilMotionPage />);
    releaseIdleCallbacks();
    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

    expect(one(screen.container, "[data-fil-strike]").style.transform).toBe("");
    expect(one(screen.container, "[data-fil-thread]").style.strokeDasharray).toBe("");
  });

  it("does nothing without a page to move", async () => {
    const screen = await render(<FilMotionRuntime scope={{ current: null }} />);

    expect(screen.container.childElementCount).toBe(0);
  });

  it("draws each craft card back under the next one as it slides over it", async () => {
    const screen = await render(<FilMotionPage />);
    const first = one(screen.container, "[data-slot=fil-expertise]");
    releaseIdleCallbacks();

    await expect.poll(() => first.style.transformOrigin).not.toBe("");
  });
});
