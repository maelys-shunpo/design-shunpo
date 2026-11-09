import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Headline } from "../src/agents/headline.tsx";
import { MethodWheel } from "../src/agents/method-wheel.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

const phases = [
  {
    id: "immersion",
    label: "5 jours auprès de vos équipes",
    title: "Immersion",
    text: "On suit votre équipe.",
    deliverables: ["Carte des processus", "Heures perdues estimées", "Feuille de route"],
    kanji: "見",
    panel: <p>Carte du flux</p>,
  },
  {
    id: "construction",
    label: "Brique par brique",
    title: "Construction",
    text: "On construit un premier flux.",
    deliverables: ["Interface de suivi", "Outils connectés"],
    kanji: "築",
    panel: <p>Flux factures</p>,
  },
  {
    id: "evolution",
    label: "Après la mise en service",
    title: "Évolution",
    text: "On suit les usages.",
    deliverables: ["Suivi des usages"],
    kanji: "進",
    panel: <p>Flux en production</p>,
  },
] as const;

function wheel() {
  return (
    <Direction name="agents">
      <MethodWheel
        title={<Headline level={2}>Chaque projet commence par une Immersion</Headline>}
        phases={phases}
        backdrop={<img alt="" />}
      />
    </Direction>
  );
}

/* Scrolls the page to a share of the wheel's hold. */
async function holdAt(share: number) {
  const track = document.querySelector<HTMLElement>("[data-slot=scroll-scene]");
  const top = (track?.getBoundingClientRect().top ?? 0) + window.scrollY;
  const length = (track?.offsetHeight ?? 0) - window.innerHeight;
  window.scrollTo(0, top + length * share);
  await pause(SETTLE_MS * 3);
}

function inkOf(container: HTMLElement) {
  return container.querySelector("[data-wheel-ink]")?.getAttribute("href") ?? "";
}

function currentOf(container: HTMLElement) {
  return container.querySelector("[data-wheel-active] h3")?.textContent ?? "";
}

describe("MethodWheel", () => {
  it("asks the question, then reads every phase with its deliverables and its board", async () => {
    const screen = await render(wheel());
    await expect
      .element(screen.getByRole("heading", { level: 2, name: /commence par une Immersion/u }))
      .toBeInTheDocument();
    expect(screen.container.querySelectorAll("h3")).toHaveLength(3);
    expect(screen.container.querySelectorAll("[data-wheel-deliverable]")).toHaveLength(6);
    await expect.element(screen.getByText("Flux en production")).toBeInTheDocument();
    expect(screen.container.querySelectorAll("[data-wheel-dot]")).toHaveLength(3);
  });

  it("paints the stroke once idle, then names a phase, frames it and ticks its deliverables", async () => {
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await expect
      .poll(() => inkOf(screen.container), { timeout: 5000 })
      .toMatch(/^data:image\/svg\+xml,/u);
    expect(currentOf(screen.container)).toBe("");

    await holdAt(0.6);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Construction");
    const current = screen.container.querySelector("[data-wheel-active] [data-wheel-copy]");
    expect(current?.getAttribute("aria-current")).toBe("step");

    await holdAt(1);
    await expect.poll(() => currentOf(screen.container), { timeout: 5000 }).toBe("Évolution");
    expect(screen.container.querySelectorAll("[data-wheel-active] [data-pending]")).toHaveLength(0);
  });

  it("holds nothing under reduced motion: no stroke, no phase singled out", async () => {
    await preferReducedMotion();
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await holdAt(0.6);
    expect(inkOf(screen.container)).toBe("");
    expect(currentOf(screen.container)).toBe("");
  });

  it("stacks the phases on phones, without the ink", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(wheel());
    releaseIdleCallbacks();
    await pause(SETTLE_MS);
    const ink = screen.container.querySelector<SVGElement>("[data-slot=wheel-ink]");
    await expect.element(ink).not.toBeVisible();
    expect(currentOf(screen.container)).toBe("");
    await expect.element(screen.getByText("Carte des processus")).toBeVisible();
  });
});
