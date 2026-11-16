import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Entry } from "../src/instant/entry.tsx";
import { Reveal } from "../src/instant/reveal.tsx";
import { Heading } from "../src/typography/heading.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

const ENTRANCE = { timeout: 5000 };
let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  vi.restoreAllMocks();
  window.scrollTo(0, 0);
  await allowMotion();
});

function linesOf(container: HTMLElement): number {
  return container.querySelectorAll("[data-slot=heading] div").length;
}

describe("Instant Reveal", () => {
  it("leaves a heading in view as painted, and splits the ones below the window into masked lines", async () => {
    const screen = await render(
      <>
        <Reveal>
          <Heading level={2}>Vu dès le chargement</Heading>
        </Reveal>
        <div style={{ height: "160vh" }} />
        <Reveal>
          <Heading level={2}>Révélé à l’arrivée</Heading>
        </Reveal>
      </>,
    );
    releaseIdleCallbacks();

    await expect.poll(() => linesOf(screen.container), ENTRANCE).toBeGreaterThan(0);
    screen.getByText("Révélé à l’arrivée").element().scrollIntoView();
    await expect.element(screen.getByText("Révélé à l’arrivée")).toBeVisible();
  });

  it("brushes in list items from the left once they enter the window", async () => {
    const screen = await render(
      <>
        <div style={{ height: "160vh" }} />
        <Reveal mode="sweep">
          <ol>
            <Entry index="01" title="Des heures perdues">
              Copier, relancer, chercher.
            </Entry>
          </ol>
        </Reveal>
      </>,
    );
    const entry = screen.container.querySelector<HTMLElement>("[data-slot=entry]");
    releaseIdleCallbacks();

    await expect.poll(() => entry?.style.clipPath, ENTRANCE).toContain("100%");
    entry?.scrollIntoView();
    await expect.poll(() => entry?.style.clipPath, ENTRANCE).toBe("");
  });

  it("plays nothing when motion is reduced", async () => {
    await preferReducedMotion();
    const screen = await render(
      <>
        <div style={{ height: "160vh" }} />
        <Reveal>
          <Heading level={2}>Immobile</Heading>
        </Reveal>
      </>,
    );
    releaseIdleCallbacks();
    await new Promise((resolve) => {
      setTimeout(resolve, 600);
    });

    expect(linesOf(screen.container)).toBe(0);
  });
});
