import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { RollingFigure } from "../src/agents/rolling-figure.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

const ENTRANCE = { timeout: 8000 };
let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

function figure(options: { below?: boolean; figure?: string; wall?: boolean }) {
  const wall = options.wall === true ? { "data-arrival": "arrived" } : {};
  return (
    <Direction name="agents">
      {options.below === false ? null : <div style={{ height: "160vh" }} />}
      <div {...wall}>
        <RollingFigure figure={options.figure ?? "+1,4"} unit="M" />
      </div>
      <div style={{ height: "160vh" }} />
    </Direction>
  );
}

/* Scrolls so the figure stands low in the window (three quarters down), past the wall's line and short of the page's
   usual one (a third up from the foot). */
function standLow(container: HTMLElement): void {
  const top = rootOf(container).getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, top - window.innerHeight * 0.75);
}

function wheelsOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-figure-wheel]")];
}

/* How many cells a wheel's column has rolled past (fractional), and its run's length in cells. */
function rollOf(wheel: HTMLElement): { cells: number; steps: number } {
  const column = wheel.querySelector<HTMLElement>("[data-figure-column]");
  if (column === null) {
    return { cells: Number.NaN, steps: 0 };
  }
  const steps = column.children.length - 1;
  const down = -new DOMMatrix(getComputedStyle(column).transform).m42;
  const cell = column.scrollHeight / (steps + 1);
  return { cells: cell === 0 ? Number.NaN : down / cell, steps };
}

/* How far a wheel's column has rolled, as a share of its full run (0 at rest, 1 stopped on its value). */
function runShareOf(wheel: HTMLElement): number {
  const { cells, steps } = rollOf(wheel);
  return steps <= 0 ? Number.NaN : cells / steps;
}

/* Stopped on its value: the visible cell is the column's last, give or take measurement rounding. */
function allStopped(container: HTMLElement): boolean {
  const wheels = wheelsOf(container);
  return (
    wheels.length > 0 &&
    wheels.every((wheel) => {
      const { cells, steps } = rollOf(wheel);
      return steps > 0 && Math.abs(cells - steps) < 0.2;
    })
  );
}

/* Mid-run, how far the first wheel leads the second, in share of their runs; NaN outside the first wheel's run. */
function firstWheelLead(container: HTMLElement): number {
  const [first, second] = wheelsOf(container).map((wheel) => runShareOf(wheel));
  if (first === undefined || second === undefined || first <= 0 || first >= 1) {
    return Number.NaN;
  }
  return first - second;
}

/* The top of the first line of text an element holds (a wheel's sizer, a glyph), whatever the box around it. */
function textTopOf(element: Element): number {
  const range = document.createRange();
  range.selectNodeContents(element.firstChild ?? element);
  return range.getBoundingClientRect().top;
}

/* How far the first digit's text stands from the line of the figure's first other sign, in pixels. */
function wheelTopOffset(container: HTMLElement): number {
  const wheel = container.querySelector("[data-figure-wheel]");
  const sign = container.querySelector("[data-figure-glyph]");
  return wheel === null || sign === null
    ? Number.NaN
    : Math.abs(textTopOf(wheel) - textTopOf(sign));
}

function rootOf(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>("[data-slot=rolling-figure]");
  if (root === null) {
    throw new Error("no figure");
  }
  return root;
}

describe("RollingFigure", () => {
  it("reads its figure out whole", async () => {
    const screen = await render(figure({ below: false }));
    const root = rootOf(screen.container);

    expect(root.textContent).toContain("+1,4");
    expect(root.querySelector("[aria-hidden=true]")).not.toBeNull();
    const reading = root.querySelector(".sr-only");
    expect(reading?.textContent).toBe("+1,4 M");
  });

  it("rolls each digit to its value, left to right, once in view", async () => {
    const screen = await render(figure({}));
    releaseIdleCallbacks();
    await expect.poll(() => wheelsOf(screen.container).length, ENTRANCE).toBe(2);
    expect(allStopped(screen.container)).toBe(false);

    rootOf(screen.container).scrollIntoView({ block: "center" });
    await expect.poll(() => firstWheelLead(screen.container), ENTRANCE).toBeGreaterThan(0);
    await expect.poll(() => allStopped(screen.container), ENTRANCE).toBe(true);
  });

  it("rolls a figure standing low on the references wall as soon as it shows", async () => {
    const screen = await render(figure({ wall: true }));
    releaseIdleCallbacks();
    await expect.poll(() => wheelsOf(screen.container).length, ENTRANCE).toBe(2);

    standLow(screen.container);

    await expect.poll(() => allStopped(screen.container), ENTRANCE).toBe(true);
  });

  it("leaves a figure standing low outside a wall to the page's usual line", async () => {
    const screen = await render(figure({}));
    releaseIdleCallbacks();
    await expect.poll(() => wheelsOf(screen.container).length, ENTRANCE).toBe(2);

    standLow(screen.container);

    await pause(SETTLE_MS);
    expect(allStopped(screen.container)).toBe(false);
  });

  it("keeps its digits on the line of its other signs once they are wheels", async () => {
    const screen = await render(figure({}));
    releaseIdleCallbacks();
    await expect.poll(() => wheelsOf(screen.container).length, ENTRANCE).toBe(2);
    rootOf(screen.container).scrollIntoView({ block: "center" });

    await expect.poll(() => wheelTopOffset(screen.container), ENTRANCE).toBeLessThan(1);
  });

  it("shows a figure with no digit as it is", async () => {
    const screen = await render(figure({ below: false, figure: "" }));
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);

    expect(wheelsOf(screen.container)).toHaveLength(0);
    expect(rootOf(screen.container).textContent).toContain("M");
  });

  it("rolls nothing under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(figure({}));
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);

    expect(wheelsOf(screen.container)).toHaveLength(0);
  });
});
