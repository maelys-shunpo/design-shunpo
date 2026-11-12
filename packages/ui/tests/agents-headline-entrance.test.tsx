import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Headline } from "../src/agents/headline.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

const ENTRANCE = { timeout: 5000 };
const TITLE = "Vos agents travaillent dans les outils que vous avez déjà";
let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

function section(below: boolean) {
  return (
    <Direction name="agents">
      {below ? <div style={{ height: "160vh" }} /> : null}
      <Headline level={2} align="center" entrance="lines">
        {TITLE}
      </Headline>
      <div style={{ height: "160vh" }} />
    </Direction>
  );
}

function linesOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-entrance-line]")];
}

/* How far a line still sits below its rest, in px, and how much it still leans, in degrees. */
function offsetOf(line: HTMLElement): { down: number; lean: number } {
  const matrix = new DOMMatrix(getComputedStyle(line).transform);
  return { down: matrix.m42, lean: Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI) };
}

function landed(container: HTMLElement): boolean {
  const lines = linesOf(container);
  return (
    lines.length > 0 &&
    lines.every((line) => {
      const { down, lean } = offsetOf(line);
      return Math.abs(down) < 0.5 && lean === 0;
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

function firstLineOf(container: HTMLElement): HTMLElement {
  const [first] = linesOf(container);
  if (first === undefined) {
    throw new Error("no line");
  }
  return first;
}

/* The mask SplitText wraps each line in. */
function maskOverflowOf(line: HTMLElement): string {
  if (line.parentElement === null) {
    throw new Error("no mask");
  }
  return getComputedStyle(line.parentElement).overflow;
}

function anchorDisplayOf(container: HTMLElement): string {
  const anchor = container.querySelector<HTMLElement>("[data-slot=headline-entrance]");
  if (anchor === null) {
    throw new Error("no anchor");
  }
  return getComputedStyle(anchor).display;
}

function lettersSplit(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-entrance-letter]")];
}

function lettersLanded(container: HTMLElement): boolean {
  const letters = lettersSplit(container);
  return (
    letters.length > 0 &&
    letters.every((letter) => new DOMMatrix(getComputedStyle(letter).transform).m42 === 0)
  );
}

/* Split by words then letters, a word is never cut: every line's text ends on a whole word of the call. */
function wordsWholeOnTheirLine(container: HTMLElement): boolean {
  const words = "Commençons par une tâche qui vous prend du temps".split(" ");
  const lines = [...container.querySelectorAll<HTMLElement>("[data-entrance-line]")];
  const rows = lines.length > 0 ? lines : [headlineOf(container)];
  return rows.every((row) => {
    const text = (row.textContent ?? "").trim();
    return text === "" || words.some((word) => text.endsWith(word));
  });
}

describe("Headline entrance: lines", () => {
  it("leaves the headline as painted until idle", async () => {
    const screen = await render(section(true));

    await expect.element(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
    expect(linesOf(screen.container)).toHaveLength(0);
  });

  it("raises its lines from behind their edge once well inside the window", async () => {
    const screen = await render(section(true));
    releaseIdleCallbacks();
    await expect.poll(() => linesOf(screen.container).length, ENTRANCE).toBeGreaterThan(0);
    const first = firstLineOf(screen.container);
    expect(offsetOf(first).down).toBeGreaterThan(0);
    expect(offsetOf(first).lean).toBe(4);

    headlineOf(screen.container).scrollIntoView({ block: "center" });
    await expect.poll(() => landed(screen.container), ENTRANCE).toBe(true);
    await expect.poll(() => maskOverflowOf(first), ENTRANCE).toBe("visible");
    await expect.element(screen.getByRole("heading", { name: TITLE })).toBeInTheDocument();
  });

  it("leaves a headline already in view as painted", async () => {
    const screen = await render(section(false));
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);

    expect(linesOf(screen.container)).toHaveLength(0);
  });

  it("animates nothing under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(section(true));
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);

    expect(linesOf(screen.container)).toHaveLength(0);
  });

  it("gives the headline back as plain text when unmounted mid-entrance", async () => {
    const screen = await render(section(true));
    releaseIdleCallbacks();
    await expect.poll(() => linesOf(screen.container).length, ENTRANCE).toBeGreaterThan(0);
    headlineOf(screen.container).scrollIntoView({ block: "center" });

    await screen.unmount();
    expect(document.querySelectorAll("[data-entrance-line]")).toHaveLength(0);
  });

  it("raises the call letter by letter from behind each letter's edge", async () => {
    const screen = await render(
      <Direction name="agents">
        <div style={{ height: "160vh" }} />
        <Headline level={2} align="center" entrance="letters">
          Commençons par une tâche qui vous prend du temps
        </Headline>
        <div style={{ height: "160vh" }} />
      </Direction>,
    );
    releaseIdleCallbacks();
    await expect.poll(() => lettersSplit(screen.container).length, ENTRANCE).toBeGreaterThan(0);
    expect(wordsWholeOnTheirLine(screen.container)).toBe(true);

    headlineOf(screen.container).scrollIntoView({ block: "center" });
    await expect.poll(() => lettersLanded(screen.container), ENTRANCE).toBe(true);
    await expect
      .element(
        screen.getByRole("heading", { name: "Commençons par une tâche qui vous prend du temps" }),
      )
      .toBeInTheDocument();
  });

  it("keeps the hidden anchor out of the layout", async () => {
    const screen = await render(section(true));

    expect(anchorDisplayOf(screen.container)).toBe("none");
  });
});
