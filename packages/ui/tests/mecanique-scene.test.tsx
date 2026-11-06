import "../src/styles/globals.css";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { MecaniqueStage } from "../src/motion/mecanique-stage.tsx";
import { warm } from "../src/scene/mecanique-resources.ts";
import { MecaniqueScene } from "../src/scene/mecanique-scene.tsx";
import { LIVE_TIMEOUT } from "../stories/support/live-timeout.ts";
import { canvasIn, canvasPixels, countPixels } from "./support/canvas-pixels.ts";
import { DESKTOP } from "./support/viewports.ts";

/* Lit metal: a pixel clearly brighter than the transparent ground. */
function lit(red: number, green: number, blue: number): boolean {
  return red + green + blue > 240;
}

async function renderScene(progress: { value: number }) {
  const ready = vi.fn<() => void>();
  const screen = await render(
    <StrictMode>
      <div data-direction="mecanique" style={{ width: 240, height: 240, position: "relative" }}>
        <MecaniqueScene tier="light" onReady={ready} progress={progress} />
      </div>
    </StrictMode>,
  );
  await expect.poll(() => ready.mock.calls.length, LIVE_TIMEOUT).toBeGreaterThan(0);
  return canvasIn(screen.container);
}

describe("Mecanique scene", () => {
  it("warms Shiro toward brass without touching its red", () => {
    expect(warm([229, 223, 211])).toEqual([229, 196, 139]);
  });

  it("draws the exploded calibre after StrictMode's double mount", async () => {
    const canvas = await renderScene({ value: 0 });

    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), lit), LIVE_TIMEOUT)
      .toBeGreaterThan(40);
  });

  it("follows the page's progress: the closed dial fills the frame with light", async () => {
    const progress = { value: 0 };
    const canvas = await renderScene(progress);
    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), lit), LIVE_TIMEOUT)
      .toBeGreaterThan(40);
    const exploded = countPixels(await canvasPixels(canvas), lit);

    progress.value = 1;

    await expect
      .poll(async () => countPixels(await canvasPixels(canvas), lit), LIVE_TIMEOUT)
      .toBeGreaterThan(exploded * 1.5);
  });
});

describe("MecaniqueStage", () => {
  it("names its pause control in French once the calibre is live", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(
      <div data-direction="mecanique">
        <MecaniqueStage
          size="md"
          progress={{ value: 0 }}
          poster={
            <img alt="Calibre en vue éclatée" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
          }
        />
      </div>,
    );

    await expect
      .element(screen.getByRole("img", { name: "Calibre en vue éclatée" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: "Mettre l’animation en pause" }), LIVE_TIMEOUT)
      .toBeVisible();
  });
});
