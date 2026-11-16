import "../src/styles/globals.css";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Arrival } from "../src/agents/arrival.tsx";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

/* The arrival state the wrapper reports through `data-arrival`. */
function stateOf(container: HTMLElement): string | undefined {
  const wrapper = container.querySelector<HTMLElement>("[data-slot='arrival']");
  return wrapper?.dataset["arrival"];
}

describe("Arrival", () => {
  afterEach(async () => {
    await allowMotion();
  });

  it("paints its content in place under reduced motion, even below the fold", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    await preferReducedMotion();
    const screen = await render(
      <div>
        <div style={{ height: `${DESKTOP.height * 2}px` }} />
        <Arrival mode="follow">
          <p>Le mouvement réduit peint sur place.</p>
        </Arrival>
      </div>,
    );

    await expect.element(screen.getByText(/sur place/u)).toBeVisible();
    expect(stateOf(screen.container)).toBe("arrived");
  });

  it("shows its content and reports it arrived when it is already in view", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(
      <Arrival mode="follow">
        <p>Quand un outil n’a pas de connecteur, nous le construisons.</p>
      </Arrival>,
    );

    await expect.element(screen.getByText(/connecteur/u)).toBeVisible();
    expect(stateOf(screen.container)).toBe("arrived");
  });

  it("waits off screen, then arrives once it is scrolled a third into view", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(
      <div>
        <div style={{ height: `${DESKTOP.height * 2}px` }} />
        <Arrival mode="block">
          <p>Un bloc qui attend d’être vu.</p>
        </Arrival>
        <div style={{ height: `${DESKTOP.height * 2}px` }} />
      </div>,
    );

    /* Below the fold, it settles into its waiting state. */
    await expect.poll(() => stateOf(screen.container)).toBe("waiting");

    screen
      .getByText(/attend/u)
      .element()
      .scrollIntoView({ block: "center" });

    await expect.poll(() => stateOf(screen.container), { timeout: 3000 }).toBe("arrived");
  });
});
