import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { LIVE_TIMEOUT } from "../stories/support/live-timeout.ts";
import { BoxStage, stageAt } from "./support/box-stage.tsx";
import { allowMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

/* The poster's layer: the stage's first child. */
function posterLayer(stage: HTMLElement): HTMLElement {
  const layer = stage.firstElementChild;
  if (!(layer instanceof HTMLElement)) {
    throw new TypeError("The stage has no poster layer.");
  }
  return layer;
}

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

afterEach(async () => {
  await allowMotion();
});

describe("Stage poster exit", () => {
  it("fades the poster out over the scene by default", async () => {
    const screen = await render(<BoxStage name="Faded box" />);
    const stage = stageAt(screen.container);
    await expect.poll(() => stage.dataset["stage"], LIVE_TIMEOUT).toBe("live");

    expect(getComputedStyle(posterLayer(stage)).transitionDuration).not.toBe("0s");
  });

  /* A scene that goes live in the middle of a scroll has moved on from its first frame: a fade would lay the
     first frame over it, a ghost of the start. A cut hands over at once. */
  it("cuts from the poster to the scene when asked to", async () => {
    const screen = await render(<BoxStage name="Cut box" posterExit="cut" />);
    const stage = stageAt(screen.container);
    await expect.poll(() => stage.dataset["stage"], LIVE_TIMEOUT).toBe("live");

    const poster = getComputedStyle(posterLayer(stage));
    expect(poster.transitionDuration).toBe("0s");
    expect(poster.opacity).toBe("0");
  });
});
