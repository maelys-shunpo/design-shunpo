import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { PaperSheen } from "../src/agents/paper-sheen.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  await allowMotion();
});

function surface() {
  return (
    <Direction name="agents">
      <div data-testid="sheet" className="agents-sheet" style={{ width: "400px", height: "240px" }}>
        <PaperSheen />
        <p>Une feuille de papier.</p>
      </div>
    </Direction>
  );
}

function sheenOf(container: HTMLElement): HTMLElement {
  const sheen = container.querySelector<HTMLElement>("[data-slot=paper-sheen]");
  if (sheen === null) {
    throw new Error("no sheen layer");
  }
  return sheen;
}

function hoverAt(sheet: Element, x: number, y: number): void {
  const box = sheet.getBoundingClientRect();
  const init = { clientX: box.left + x, clientY: box.top + y, pointerType: "mouse", bubbles: true };
  sheet.dispatchEvent(new PointerEvent("pointerenter", init));
  sheet.dispatchEvent(new PointerEvent("pointermove", init));
}

describe("PaperSheen", () => {
  it("lights the paper and follows the pointer, a beat behind", async () => {
    const screen = await render(surface());
    releaseIdleCallbacks();
    await pause(SETTLE_MS);

    const sheet = screen.getByTestId("sheet").element();
    hoverAt(sheet, 300, 60);

    await expect
      .poll(() => sheenOf(screen.container).style.getPropertyValue("--sheen-on"))
      .toBe("1");
    await expect
      .poll(() => sheenOf(screen.container).style.getPropertyValue("--sheen-x"))
      .toMatch(/%$/u);
  });

  it("leaves the paper plain under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(surface());
    releaseIdleCallbacks();
    await pause(SETTLE_MS);

    const sheet = screen.getByTestId("sheet").element();
    hoverAt(sheet, 300, 60);
    await pause(SETTLE_MS);

    const sheen = sheenOf(screen.container);
    expect(getComputedStyle(sheen).display).toBe("none");
    expect(sheen.style.getPropertyValue("--sheen-on")).toBe("");
  });
});
