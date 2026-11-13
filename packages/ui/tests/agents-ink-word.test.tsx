import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Headline } from "../src/agents/headline.tsx";
import { InkWord } from "../src/agents/ink-word.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

const ENTRANCE = { timeout: 5000 };
let releaseIdleCallbacks: () => void;

function required<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

function question(below: boolean) {
  return (
    <Direction name="agents">
      {below ? <div style={{ height: "160vh" }} /> : null}
      <Headline level={2} align="center">
        Notre méthode&#8239;: chaque projet commence par une <InkWord>Immersion</InkWord>
      </Headline>
      <div style={{ height: "160vh" }} />
    </Direction>
  );
}

function lettersOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-focus-letter]")];
}

function letterOpacities(container: HTMLElement): number[] {
  return lettersOf(container).map((letter) => Number(getComputedStyle(letter).opacity));
}

/* The word is in focus once every letter is fully shown with no blur left. */
function wordInFocus(container: HTMLElement): boolean {
  const letters = lettersOf(container);
  return (
    letters.length > 0 &&
    letters.every((letter) => {
      const style = getComputedStyle(letter);
      return Number(style.opacity) === 1 && style.filter === "none";
    })
  );
}

function bracketsOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-slot=ink-word] [data-ink-bracket]")];
}

/* A bracket is closed on the word once fully shown and back at its resting place. */
function bracketsClosed(container: HTMLElement): boolean {
  const brackets = bracketsOf(container);
  return (
    brackets.length === 2 &&
    brackets.every((bracket) => {
      const style = getComputedStyle(bracket);
      return Number(style.opacity) === 1 && new DOMMatrix(style.transform).m41 === 0;
    })
  );
}

/* The brackets' box against the word's letters: from just above the capitals to just below the baseline. */
function bracketReach(container: HTMLElement): { above: number; below: number } {
  const [bracket] = bracketsOf(container);
  const text = container.querySelector<HTMLElement>("[data-slot=ink-word] > span");
  if (bracket === undefined || text === null) {
    return { above: Number.NaN, below: Number.NaN };
  }
  const box = bracket.getBoundingClientRect();
  const letters = text.getBoundingClientRect();
  const size = Number(getComputedStyle(text).fontSize.replace("px", ""));
  return { above: (letters.top - box.top) / size, below: (box.bottom - letters.bottom) / size };
}

function linesOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-entrance-line]")];
}

function headlineOf(container: HTMLElement): HTMLElement {
  const headline = container.querySelector<HTMLElement>("[data-slot=headline]");
  if (headline === null) {
    throw new Error("no headline");
  }
  return headline;
}

describe("InkWord", () => {
  it("paints the word in ink between its square brackets, which assistive tech skips", async () => {
    const screen = await render(question(false));

    await expect
      .element(
        screen.getByRole("heading", {
          name: "Notre méthode : chaque projet commence par une Immersion",
        }),
      )
      .toBeVisible();
    const brackets = bracketsOf(screen.container);
    expect(brackets).toHaveLength(2);
    expect(brackets.every((bracket) => bracket.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(bracketsClosed(screen.container)).toBe(true);
    /* They hold the word, not the line: never more than a fifth of an em past its letters. */
    expect(bracketReach(screen.container).above).toBeLessThan(0.2);
    expect(bracketReach(screen.container).below).toBeLessThan(0.2);
  });

  it("makes room for its brackets in proportion to the type, with no off-scale padding", async () => {
    const screen = await render(question(false));
    const word = required(
      screen.container.querySelector<HTMLElement>("[data-slot=ink-word]"),
      "no word",
    );
    const text = required(word.querySelector<HTMLElement>("[data-ink-text]"), "no text");
    const style = getComputedStyle(word);
    expect([style.paddingInlineStart, style.paddingInlineEnd]).toEqual(["0px", "0px"]);
    const size = Number(style.fontSize.replace("px", ""));
    const outer = word.getBoundingClientRect();
    const inner = text.getBoundingClientRect();
    expect((inner.left - outer.left) / size).toBeCloseTo(0.3, 2);
    expect((outer.right - inner.right) / size).toBeCloseTo(0.3, 2);
  });

  it("raises its headline's lines, then brings the word into focus letter by letter and closes the brackets on it, once well inside the window", async () => {
    const screen = await render(question(true));
    releaseIdleCallbacks();
    await expect.poll(() => linesOf(screen.container).length, ENTRANCE).toBeGreaterThan(0);
    expect(lettersOf(screen.container)).toHaveLength(9);
    expect(Math.max(...letterOpacities(screen.container))).toBe(0);
    /* Split into lines, the headline keeps its narrow no-break space: « : » never starts a line. */
    expect(headlineOf(screen.container).textContent).toContain("méthode :");

    headlineOf(screen.container).scrollIntoView({ block: "center" });
    await expect.poll(() => wordInFocus(screen.container), ENTRANCE).toBe(true);
    await expect.poll(() => bracketsClosed(screen.container), ENTRANCE).toBe(true);
  });

  it("replays the whole headline already in view", async () => {
    const screen = await render(question(false));
    releaseIdleCallbacks();
    await expect.poll(() => linesOf(screen.container).length, ENTRANCE).toBeGreaterThan(0);
    await expect
      .poll(() => Math.min(...letterOpacities(screen.container)), ENTRANCE)
      .toBeLessThan(1);

    await expect.poll(() => wordInFocus(screen.container), ENTRANCE).toBe(true);
    await expect.poll(() => bracketsClosed(screen.container), ENTRANCE).toBe(true);
  });

  it("brings nothing into focus under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(question(true));
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);

    expect(lettersOf(screen.container)).toHaveLength(0);
    expect(linesOf(screen.container)).toHaveLength(0);
    expect(bracketsClosed(screen.container)).toBe(true);
  });
});
