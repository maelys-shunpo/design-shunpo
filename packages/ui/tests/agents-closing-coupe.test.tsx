import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { ClosingCoupe } from "../src/agents/closing-coupe.tsx";
import { CoupeScene } from "../src/agents/coupe-scene.tsx";
import { readingFraction } from "../src/motion/coupe-geometry.ts";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

/* A FAQ with a focusable control, so a test can open an answer before the cut reveals the closing. */
const faq = (
  <div>
    <h2>Questions fréquentes</h2>
    <button type="button">Combien de temps ?</button>
  </div>
);

const closing = (
  <div>
    <h2>Le dernier logiciel dont vous aurez besoin</h2>
    <a href="#parler">Parlons de votre projet</a>
  </div>
);

/* A FAQ far taller than the window, to prove the pinned scene clips it rather than growing a scrollbar. */
const tallFaq = (
  <div>
    <h2>Questions fréquentes</h2>
    {Array.from({ length: 60 }, (_, index) => (
      // oxlint-disable-next-line react/no-array-index-key -- a fixed fixture list, never reordered.
      <p key={index}>
        {`Une question parmi beaucoup, assez longue pour passer la hauteur de la fenêtre, numéro ${String(index)}.`}
      </p>
    ))}
  </div>
);

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  releaseIdleCallbacks();
  await allowMotion();
});

/* One frame past the reveal: the gesture is complete, the halves have fallen, the night is uncovered. */
const REVEALED = 1;
/* Still in the reading dwell: the FAQ is read whole and no part of the gesture has started. */
/* Past the dwell, the cut under way but the halves not yet parted enough to uncover the closing. */
const MID_GESTURE = readingFraction() + 0.05;
const DWELL = readingFraction() / 2;

function layer(root: ParentNode, name: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(`[data-coupe-layer="${name}"]`);
  if (element === null) {
    throw new Error(`layer ${name} not found`);
  }
  return element;
}

function focusElement(element: Element): HTMLElement {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("expected an HTML element to focus");
  }
  element.focus();
  return element;
}

describe("ClosingCoupe", () => {
  it("shows the FAQ and the closing call the coupe uncovers", async () => {
    const screen = await render(<ClosingCoupe faq={faq}>{closing}</ClosingCoupe>);

    await expect
      .element(screen.getByRole("heading", { name: "Le dernier logiciel dont vous aurez besoin" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "Parlons de votre projet" }))
      .toBeVisible();
  });

  it("reads the FAQ then the closing directly on phones, with no cut and no frozen copy", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(<ClosingCoupe faq={faq}>{closing}</ClosingCoupe>);

    await expect
      .element(screen.getByRole("heading", { name: "Questions fréquentes" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("heading", { name: "Le dernier logiciel dont vous aurez besoin" }))
      .toBeVisible();
    expect(screen.container.querySelector("canvas")).toBeNull();
    /* The halves layer, the frozen second FAQ, stays hidden off desktop so a reader never meets the FAQ twice. */
    expect(layer(screen.container, "halves").offsetParent).toBeNull();
  });

  it("reads the whole FAQ and closing under reduced motion, with no gesture", async () => {
    await preferReducedMotion();
    const screen = await render(<ClosingCoupe faq={faq}>{closing}</ClosingCoupe>);

    await expect
      .element(screen.getByRole("heading", { name: "Questions fréquentes" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("heading", { name: "Le dernier logiciel dont vous aurez besoin" }))
      .toBeVisible();
    expect(screen.container.querySelector("canvas")).toBeNull();
    /* Nothing is held inert under reduced motion: the closing reads in normal flow. */
    expect(layer(screen.container, "closing").inert).toBe(false);
    /* The frozen copies and the blade are never painted. */
    expect(layer(screen.container, "halves").offsetParent).toBeNull();
    expect(layer(screen.container, "blade").offsetParent).toBeNull();
  });

  it("clips a FAQ taller than the window instead of scrolling inside the pinned scene", async () => {
    const screen = await render(<ClosingCoupe faq={tallFaq}>{closing}</ClosingCoupe>);

    /* The FAQ layer itself must clip: an `auto` or `scroll` here would give the pinned FAQ its own scrollbar. */
    const faqLayer = layer(screen.container, "faq");
    expect(["clip", "hidden"]).toContain(getComputedStyle(faqLayer).overflowY);
    expect(faqLayer.scrollHeight).toBeGreaterThan(faqLayer.clientHeight);
  });
});

describe("CoupeScene gesture", () => {
  it("holds the closing inert while the FAQ covers it, then lets it be reached once revealed", async () => {
    const progress = { value: DWELL };
    const screen = await render(
      <CoupeScene faq={faq} progress={progress}>
        {closing}
      </CoupeScene>,
    );

    await vi.waitFor(() => {
      expect(layer(screen.container, "closing").inert).toBe(true);
    });

    progress.value = REVEALED;
    await vi.waitFor(() => {
      expect(layer(screen.container, "closing").inert).toBe(false);
    });
  });

  it("hides the frozen FAQ copies from assistive tech once the closing is revealed", async () => {
    const progress = { value: DWELL };
    const screen = await render(
      <CoupeScene faq={faq} progress={progress}>
        {closing}
      </CoupeScene>,
    );

    progress.value = REVEALED;
    await vi.waitFor(() => {
      const halves = layer(screen.container, "halves");
      expect(halves.inert).toBe(true);
      expect(halves.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("never strands focus in a hidden or inert layer from the dwell to the reveal", async () => {
    const progress = { value: DWELL };
    const screen = await render(
      <CoupeScene faq={faq} progress={progress}>
        {closing}
      </CoupeScene>,
    );

    const button = focusElement(
      screen.getByRole("button", { name: "Combien de temps ?" }).element(),
    );
    expect(document.activeElement).toBe(button);

    /* Mid-gesture: the live FAQ is hidden, focus has been parked on the scene, not lost to the body. */
    progress.value = MID_GESTURE;
    await vi.waitFor(() => {
      expect(layer(screen.container, "faq").offsetParent).toBeNull();
      expect(document.activeElement).toBe(layer(screen.container, "scene"));
    });
    expect(layer(screen.container, "closing").inert).toBe(true);

    /* Revealed: the closing is reachable and takes the focus. */
    progress.value = REVEALED;
    await vi.waitFor(() => {
      const closingLayer = layer(screen.container, "closing");
      expect(closingLayer.inert).toBe(false);
      expect(closingLayer.contains(document.activeElement)).toBe(true);
    });
  });
});
