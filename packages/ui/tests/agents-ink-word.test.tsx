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

/* How much of the word the ink has still to write: 1 before it starts, 0 once written, "" when painted as is. */
function sweepOf(container: HTMLElement): string {
  const word = container.querySelector<HTMLElement>("[data-slot=ink-word]");
  return word?.style.getPropertyValue("--ink-sweep") ?? "";
}

/* A bracket is drawn once nothing of it is clipped away; it is traced from its top leg down to its foot. */
function bracketsDrawn(container: HTMLElement): boolean[] {
  return bracketsOf(container).map((bracket) => getComputedStyle(bracket).clipPath === "none");
}

function bracketsOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-slot=ink-word] [data-ink-bracket]")];
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

/* Brings the headline to the window's foot (its top 24 px inside) or to its centre. */
function scrollHeadlineTo(container: HTMLElement, place: "foot" | "centre"): void {
  const headline = container.querySelector<HTMLElement>("[data-slot=headline]");
  if (headline === null) {
    return;
  }
  if (place === "centre") {
    headline.scrollIntoView({ block: "center" });
    return;
  }
  window.scrollBy(0, headline.getBoundingClientRect().top - window.innerHeight + 24);
}

function maskedLines(container: HTMLElement): number {
  return container.querySelectorAll("[data-slot=headline] [data-ink-line]").length;
}

describe("InkWord", () => {
  it("paints the word in ink between its square brackets, which assistive tech skips", async () => {
    const screen = await render(question(false));

    await expect
      .element(
        screen.getByRole("heading", {
          name: "Notre méthode\u202F: chaque projet commence par une Immersion",
        }),
      )
      .toBeVisible();
    const brackets = bracketsOf(screen.container);
    expect(brackets).toHaveLength(2);
    expect(brackets.every((bracket) => bracket.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(bracketsDrawn(screen.container)).toEqual([true, true]);
    /* They hold the word, not the line: never more than a fifth of an em past its letters. */
    expect(bracketReach(screen.container).above).toBeLessThan(0.2);
    expect(bracketReach(screen.container).below).toBeLessThan(0.2);
  });

  it("leaves a word already in view as painted", async () => {
    const screen = await render(question(false));
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);

    expect(sweepOf(screen.container)).toBe("");
    expect(maskedLines(screen.container)).toBe(0);
  });

  it("raises its headline's lines, then writes the word and draws its brackets, once well inside the window", async () => {
    const screen = await render(question(true));
    releaseIdleCallbacks();
    await expect.poll(() => sweepOf(screen.container), ENTRANCE).toBe("1");
    expect(maskedLines(screen.container)).toBeGreaterThan(0);
    /* Split into lines, the headline keeps its narrow no-break space: « : » never starts a line. */
    expect(screen.container.querySelector("[data-slot=headline]")?.textContent).toContain(
      "méthode\u202F:",
    );
    expect(bracketsDrawn(screen.container)).toEqual([false, false]);

    /* Just inside the window's foot: not yet. */
    scrollHeadlineTo(screen.container, "foot");
    await pause(SETTLE_MS * 2);
    expect(sweepOf(screen.container)).toBe("1");

    scrollHeadlineTo(screen.container, "centre");
    await expect.poll(() => sweepOf(screen.container), ENTRANCE).toBe("0");
    await expect.poll(() => bracketsDrawn(screen.container), ENTRANCE).toEqual([true, true]);
  });

  it("writes nothing under reduced motion: the word and its brackets stay painted", async () => {
    await preferReducedMotion();
    const screen = await render(question(true));
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);

    expect(sweepOf(screen.container)).toBe("");
    expect(maskedLines(screen.container)).toBe(0);
    expect(bracketsDrawn(screen.container)).toEqual([true, true]);
  });
});
