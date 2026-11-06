import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { CaseCard } from "../src/agents/case-card.tsx";
import { CaseRing } from "../src/agents/case-ring.tsx";
import { Marquee } from "../src/agents/marquee.tsx";
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
  vi.restoreAllMocks();
  window.scrollTo(0, 0);
  await allowMotion();
});

/* The inline transform GSAP wrote on the first match, empty when none. */
function transformOf(container: HTMLElement, selector: string): string {
  return container.querySelector<HTMLElement>(selector)?.style.transform ?? "";
}

const cards = ["a", "b", "c", "d", "e"].map((id) => (
  <CaseCard key={id} href={`#${id}`} client={id} project="Projet" stake="Enjeu" action="Lire" />
));

describe("Agents motion", () => {
  it("drifts a marquee once idle, and keeps it still under reduced motion", async () => {
    const screen = await render(
      <Marquee label="Défilé" lap={2}>
        <span>Un</span>
        <span>Deux</span>
      </Marquee>,
    );
    releaseIdleCallbacks();
    await expect
      .poll(() => transformOf(screen.container, "[data-slot=marquee] > div"), { timeout: 5000 })
      .toContain("translate");
  });

  it("does not move a marquee under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(
      <Marquee label="Immobile" direction="down">
        <span>Un</span>
      </Marquee>,
    );
    releaseIdleCallbacks();
    await pause(SETTLE_MS);
    expect(
      screen.container.querySelector<HTMLElement>("[data-slot=marquee] > div")?.style.transform,
    ).toBe("");
  });

  it("bends the reference cards on a curve on wide screens", async () => {
    const screen = await render(<CaseRing label="Projets" items={cards} />);
    releaseIdleCallbacks();
    await expect
      .poll(() => transformOf(screen.container, "[data-ring-card]"), { timeout: 5000 })
      .toContain("rotateY");
  });
});
