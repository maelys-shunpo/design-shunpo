import "../src/styles/globals.css";
import { siGmail, siN8n, siOdoo } from "simple-icons";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { ConnectionHub } from "../src/agents/connection-hub.tsx";
import { ReferenceTile } from "../src/agents/reference-tile.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  await allowMotion();
});

const messages = [
  { tool: siGmail.slug, text: "A lu 3 factures" },
  { tool: siOdoo.slug, text: "A préparé 2 brouillons" },
];

function hub() {
  return (
    <ConnectionHub
      label="Un agent relié à vos outils"
      hub={<span>Agent</span>}
      near={[siGmail, siOdoo]}
      far={[siN8n]}
      messages={messages}
    />
  );
}

/* The tool and the line lit right now. */
function lit(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("[data-on]")].map(
    (element) => element.dataset["hubTool"] ?? element.dataset["hubMessage"],
  );
}

describe("ConnectionHub", () => {
  it("names every tool and every line, the first one lit before any motion", async () => {
    const screen = await render(hub());
    await expect
      .element(screen.getByRole("figure", { name: "Un agent relié à vos outils" }))
      .toBeVisible();
    await expect.element(screen.getByText("n8n")).toBeInTheDocument();
    await expect.element(screen.getByText("A préparé 2 brouillons")).toBeInTheDocument();
    expect(lit(screen.container)).toEqual([siGmail.slug, siGmail.slug]);
  });

  it("walks the tools one beat at a time once idle, and holds under the pointer", async () => {
    const screen = await render(hub());
    releaseIdleCallbacks();
    await expect
      .poll(() => lit(screen.container), { timeout: 6000 })
      .toEqual([siOdoo.slug, siOdoo.slug]);
    await userEvent.hover(screen.getByRole("figure"));
    const held = lit(screen.container);
    await pause(3200);
    expect(lit(screen.container)).toEqual(held);
  });

  it("stays on its first line under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(hub());
    releaseIdleCallbacks();
    await pause(3200);
    expect(lit(screen.container)).toEqual([siGmail.slug, siGmail.slug]);
  });
});

describe("ReferenceTile", () => {
  it("sets the name like a wordmark, or reads it behind a logo", async () => {
    const screen = await render(
      <>
        <ReferenceTile name="TF1" detail="Application de jeu" />
        <ReferenceTile name="Altaroc" logo={<svg viewBox="0 0 10 10" />} />
      </>,
    );
    await expect.element(screen.getByText("TF1")).toBeVisible();
    await expect.element(screen.getByText("Application de jeu")).toBeVisible();
    await expect.element(screen.getByText("Altaroc")).toBeInTheDocument();
  });
});
