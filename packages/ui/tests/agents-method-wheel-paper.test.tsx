import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { CoverSheet } from "../src/agents/cover-sheet.tsx";
import { Section } from "../src/layout/section.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { holdAt, inkShift, wheel } from "./support/method-wheel.tsx";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { DESKTOP } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(() => {
  window.scrollTo(0, 0);
});

/* The wheel between two sections of a washi sheet, as on the page. */
function onWashi() {
  return (
    <CoverSheet paper="washi">
      <Section aria-label="Avant" spacing="xl">
        Avant
      </Section>
      {wheel()}
      <Section aria-label="Après" spacing="xl">
        Après
      </Section>
    </CoverSheet>
  );
}

interface Grain {
  /* Where the held paper's grain starts, from its top. */
  paper: number;
  /* How far the held paper's grain is from the sheet's, within a tile (0: in phase). */
  offPhase: number;
  tile: number;
}

function grainOf(container: HTMLElement): Grain {
  const layer = container.querySelector<HTMLElement>("[data-wheel-paper]");
  const sheet = container.querySelector<HTMLElement>("[data-slot=cover-sheet]");
  const style = layer === null ? undefined : getComputedStyle(layer);
  const tile = Number(style?.backgroundSize.split(" ")[1]?.replace("px", ""));
  const paper = Number(style?.backgroundPositionY.replace("px", ""));
  const sheetTop = sheet?.getBoundingClientRect().top ?? Number.NaN;
  const layerTop = layer?.getBoundingClientRect().top ?? Number.NaN;
  const off = (((sheetTop - layerTop - paper) % tile) + tile) % tile;
  return { paper, offPhase: Math.min(off, tile - off), tile };
}

async function settled() {
  await pause(SETTLE_MS * 3);
}

function paperImage(container: HTMLElement): string {
  const layer = container.querySelector("[data-wheel-paper]");
  return layer === null ? "" : getComputedStyle(layer).backgroundImage;
}

interface Sample {
  ink: number;
  grain: Grain;
}

async function sampleAt(container: HTMLElement, share: number): Promise<Sample> {
  await holdAt(share);
  return { ink: inkShift(container), grain: grainOf(container) };
}

/* How far the paper slipped against the ink between two points of the hold, within a tile. */
function slip(before: Sample, after: Sample): number {
  const { tile } = after.grain;
  const moved = after.grain.paper - before.grain.paper - (after.ink - before.ink);
  const off = ((moved % tile) + tile) % tile;
  return Math.min(off, tile - off);
}

describe("MethodWheel on a washi sheet", () => {
  it("covers its stage with the sheet's grain, in phase with the sheet as the stage scrolls in", async () => {
    const screen = await render(onWashi());
    releaseIdleCallbacks();
    await settled();
    await holdAt(0);
    window.scrollBy(0, -window.innerHeight / 3);
    await settled();
    const grain = grainOf(screen.container);

    expect(paperImage(screen.container)).toMatch(/agents-washi/u);
    expect(grain.offPhase).toBeLessThan(1);
  });

  it("keeps its paper still while the ink rests, and moves it only as the ink rises", async () => {
    const screen = await render(onWashi());
    releaseIdleCallbacks();
    await settled();
    const question = await sampleAt(screen.container, 0.3);
    const immersion = await sampleAt(screen.container, 0.45);
    const construction = await sampleAt(screen.container, 0.6);
    const later = await sampleAt(screen.container, 0.75);
    const evolution = await sampleAt(screen.container, 0.9);

    expect(evolution.ink).toBeLessThan(immersion.ink);
    expect(slip(question, immersion)).toBeLessThan(1);
    expect(slip(immersion, construction)).toBeLessThan(1);
    expect(slip(construction, later)).toBeLessThan(1);
    expect(slip(later, evolution)).toBeLessThan(1);
  });

  it("lets go of its paper in phase with the sheet, so the stage leaves no seam", async () => {
    const screen = await render(onWashi());
    releaseIdleCallbacks();
    await settled();
    await holdAt(1);
    window.scrollBy(0, 300);
    await settled();

    expect(grainOf(screen.container).offPhase).toBeLessThan(1);
  });
});
