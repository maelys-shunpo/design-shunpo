import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Cursor } from "../src/agents/cursor.tsx";
import { Direction } from "../src/layout/direction.tsx";
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
  document.documentElement.style.cursor = "";
  await allowMotion();
});

function scene(travel: "shift" | "glide" = "shift", form: "coupe" | "satin" = "coupe") {
  return (
    <Direction name="agents">
      <Cursor travel={travel} form={form} />
      <h2 data-testid="title" data-cursor="away">
        Un grand titre
      </h2>
      <p data-testid="prose">Une phrase de lecture.</p>
      <button data-testid="button" type="button">
        Agir
      </button>
      <input data-testid="field" aria-label="Votre nom" />
      <div data-testid="card" data-cursor="designate" style={{ width: "200px", height: "120px" }}>
        Un cas
      </div>
      <div data-testid="held" data-cursor="scrub" style={{ height: "2000px" }}>
        Une scène tenue
      </div>
    </Direction>
  );
}

function layerOf(container: HTMLElement): HTMLElement {
  const layer = container.querySelector<HTMLElement>("[data-slot=agents-cursor]");
  if (layer === null) {
    throw new Error("no cursor layer");
  }
  return layer;
}

function pointAt(element: Element): void {
  const box = element.getBoundingClientRect();
  element.dispatchEvent(
    new PointerEvent("pointermove", {
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
      pointerType: "mouse",
      bubbles: true,
    }),
  );
}

async function ready(): Promise<void> {
  releaseIdleCallbacks();
  await pause(SETTLE_MS);
}

describe("Cursor", () => {
  it("shows the point over open ground and hides the system cursor", async () => {
    const screen = await render(scene());
    await ready();

    pointAt(screen.getByTestId("prose").element());

    await expect.poll(() => layerOf(screen.container).dataset["mode"]).toBe("point");
    expect(document.documentElement.style.cursor).toBe("none");
  });

  it("steps aside for a control that answers the pointer itself", async () => {
    const screen = await render(scene());
    await ready();

    pointAt(screen.getByTestId("button").element());

    await expect.poll(() => layerOf(screen.container).dataset["mode"]).toBe("hide");
  });

  it("goes away over a title, with no system cursor either", async () => {
    const screen = await render(scene());
    await ready();

    pointAt(screen.getByTestId("title").element());

    const layer = layerOf(screen.container);
    await expect.poll(() => layer.dataset["mode"]).toBe("away");
    // away draws no mark (the dot shows only for point, shrink and scrub) and keeps no system cursor
    expect(document.documentElement.style.cursor).toBe("none");
  });

  it("gives a typed field back the system cursor", async () => {
    const screen = await render(scene());
    await ready();

    pointAt(screen.getByTestId("field").element());

    await expect.poll(() => layerOf(screen.container).dataset["mode"]).toBe("native");
    expect(document.documentElement.style.cursor).toBe("");
  });

  it("jumps the two-corner frame around an element that asks to be designated", async () => {
    const screen = await render(scene());
    await ready();

    pointAt(screen.getByTestId("card").element());

    const layer = layerOf(screen.container);
    await expect.poll(() => layer.dataset["mode"]).toBe("designate");
    const frame = layer.querySelector<HTMLElement>("[data-cursor-frame]");
    expect(frame?.dataset["shown"]).toBe("");
  });

  it("fills the scrub line with how far a held scene has been read", async () => {
    const screen = await render(scene());
    await ready();
    window.scrollTo(0, 500);

    pointAt(screen.getByTestId("held").element());

    const layer = layerOf(screen.container);
    await expect.poll(() => layer.dataset["mode"]).toBe("scrub");
    const dot = layer.querySelector<HTMLElement>("[data-slot=agents-cursor-dot]");
    expect(dot?.style.getPropertyValue("--scrub")).not.toBe("");
  });

  it("glides the frame onto a designated element without a ghost", async () => {
    const screen = await render(scene("glide"));
    await ready();

    pointAt(screen.getByTestId("card").element());

    const layer = layerOf(screen.container);
    await expect.poll(() => layer.dataset["mode"]).toBe("designate");
    const frame = layer.querySelector<HTMLElement>("[data-cursor-frame]");
    expect(frame?.dataset["shown"]).toBe("");
    expect(layer.querySelector("[data-cursor-ghost]")).toBeNull();
  });

  it("places the frame at once under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(scene());
    await ready();

    pointAt(screen.getByTestId("card").element());

    const layer = layerOf(screen.container);
    await expect.poll(() => layer.dataset["mode"]).toBe("designate");
    expect(layer.querySelector("[data-cursor-ghost]")).toBeNull();
  });

  it("hugs a designated element with a cut outline in the satin form", async () => {
    const screen = await render(scene("shift", "satin"));
    await ready();

    pointAt(screen.getByTestId("card").element());

    const layer = layerOf(screen.container);
    await expect.poll(() => layer.dataset["mode"]).toBe("designate");
    const frame = layer.querySelector<HTMLElement>("[data-cursor-frame]");
    expect(frame?.dataset["form"]).toBe("satin");
    expect(frame?.dataset["shown"]).toBe("");
    // satin designation glides, never jumps, so it leaves no ghost
    expect(layer.querySelector("[data-cursor-ghost]")).toBeNull();
  });

  it("gives the system cursor back when the pointer leaves the window", async () => {
    const screen = await render(scene());
    await ready();
    pointAt(screen.getByTestId("prose").element());
    await expect.poll(() => layerOf(screen.container).dataset["mode"]).toBe("point");

    document.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));

    await expect.poll(() => layerOf(screen.container).dataset["mode"]).toBe("native");
    expect(document.documentElement.style.cursor).toBe("");
  });
});
