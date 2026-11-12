import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Headline } from "../src/agents/headline.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion } from "./support/reduced-motion.ts";
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

function thrown(title: string, narrow: boolean) {
  return (
    <Direction name="agents">
      <div style={{ height: "160vh" }} />
      <div style={narrow ? { maxWidth: "300px" } : undefined}>
        <Headline level={1} align="center" entrance="throw">
          {title}
        </Headline>
      </div>
      <div style={{ height: "160vh" }} />
    </Direction>
  );
}

function starOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-throw-star]");
}

function starX(container: HTMLElement): number {
  const star = starOf(container);
  return star === null ? Number.NaN : new DOMMatrix(getComputedStyle(star).transform).m41;
}

function starGone(container: HTMLElement): boolean {
  const star = starOf(container);
  return star === null || Number(getComputedStyle(star).opacity) === 0;
}

function wordsOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-throw-word]")];
}

function wordsStanding(container: HTMLElement): boolean {
  const words = wordsOf(container);
  return (
    words.length > 0 &&
    words.every((word) => {
      const style = getComputedStyle(word);
      const matrix = new DOMMatrix(style.transform);
      return (
        Number(style.opacity) === 1 && Math.abs(matrix.m42) < 0.5 && Math.abs(matrix.b) < 0.001
      );
    })
  );
}

function headlineOf(container: HTMLElement): HTMLElement {
  const headline = container.querySelector<HTMLElement>("[data-slot=headline]");
  if (headline === null) {
    throw new Error("no headline");
  }
  return headline;
}

function entranceSeconds(container: HTMLElement): number {
  return Number(starOf(container)?.dataset["entranceSeconds"] ?? Number.NaN);
}

describe("Headline entrance: throw", () => {
  it("throws the star across a one-line title, each word standing as it passes, and the star becomes the full stop", async () => {
    const screen = await render(thrown("Agents IA sur mesure.", false));
    releaseIdleCallbacks();
    await expect.poll(() => starOf(screen.container), ENTRANCE).not.toBeNull();

    headlineOf(screen.container).scrollIntoView({ block: "center" });
    const before = starX(screen.container);
    await expect.poll(() => starX(screen.container) - before, ENTRANCE).toBeGreaterThan(10);
    await expect.poll(() => wordsStanding(screen.container), ENTRANCE).toBe(true);
    await expect.poll(() => starGone(screen.container), ENTRANCE).toBe(true);
    await expect
      .element(screen.getByRole("heading", { name: "Agents IA sur mesure." }))
      .toBeInTheDocument();
    expect(headlineOf(screen.container).textContent).toContain(".");
  });

  it("shrinks the star to a dot and lets it go on a title without a full stop", async () => {
    const screen = await render(thrown("Agents IA sur mesure", false));
    releaseIdleCallbacks();
    await expect.poll(() => starOf(screen.container), ENTRANCE).not.toBeNull();

    headlineOf(screen.container).scrollIntoView({ block: "center" });
    await expect.poll(() => wordsStanding(screen.container), ENTRANCE).toBe(true);
    await expect.poll(() => starGone(screen.container), ENTRANCE).toBe(true);
  });

  it("falls back to the rising lines on a title that breaks over two lines", async () => {
    const screen = await render(thrown("Agents IA sur mesure pour votre entreprise", true));
    releaseIdleCallbacks();
    await expect
      .poll(() => screen.container.querySelectorAll("[data-entrance-line]").length, ENTRANCE)
      .toBeGreaterThan(1);

    expect(starOf(screen.container)).toBeNull();
  });

  it("takes about 1.6 s on « Agents IA sur mesure » at the size of a page title", async () => {
    const screen = await render(thrown("Agents IA sur mesure.", false));
    releaseIdleCallbacks();
    await expect.poll(() => entranceSeconds(screen.container), ENTRANCE).not.toBeNaN();

    expect(entranceSeconds(screen.container)).toBeGreaterThan(1.2);
    expect(entranceSeconds(screen.container)).toBeLessThan(2.2);
  });
});
