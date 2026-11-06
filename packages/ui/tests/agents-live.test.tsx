import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { LiveSurface } from "../src/agents/live-surface.tsx";
import { buildLiveScript } from "../src/agents/live-timeline.ts";
import { TypingDots } from "../src/agents/typing-dots.tsx";
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
  await allowMotion();
});

function surfaceIn(container: HTMLElement): Element {
  const root = container.querySelector("[data-slot=live-surface]");
  if (root === null) {
    throw new Error("No live surface.");
  }
  return root;
}

function styleOf(element: Element): string {
  return element.getAttribute("style") ?? "";
}

function surface() {
  return (
    <LiveSurface hold={0.2}>
      <p data-live="2">Second</p>
      <p data-live="1" data-live-kind="type">
        Premier mot
      </p>
      <span data-live="3" data-live-kind="grow">
        barre
      </span>
      <TypingDots label="L’agent écrit" live={2} />
      <span data-live="4">Fait</span>
    </LiveSurface>
  );
}

describe("live script", () => {
  it("orders the steps, ends finished, and reverts every piece", async () => {
    const screen = await render(<div>{surface()}</div>);
    const script = buildLiveScript(surfaceIn(screen.container), 1);
    script.timeline.seek(0);
    const second = screen.getByText("Second").element();
    expect(getComputedStyle(second).opacity).toBe("0");
    script.timeline.seek(script.finished);
    expect(getComputedStyle(second).opacity).toBe("1");
    expect(script.timeline.duration()).toBeGreaterThan(script.finished);
    script.revert();
    expect(styleOf(second)).not.toContain("opacity");
  });
});

describe("LiveSurface", () => {
  it("paints finished, then replays in view and pauses under the pointer", async () => {
    const screen = await render(surface());
    const second = screen.getByText("Second").element();
    expect(getComputedStyle(second).opacity).toBe("1");

    releaseIdleCallbacks();
    await pause(SETTLE_MS);
    await expect.poll(() => getComputedStyle(second).opacity, { timeout: 5000 }).toBe("0");

    await screen.getByText("Second").hover();
    const held = getComputedStyle(second).opacity;
    await pause(SETTLE_MS);
    expect(getComputedStyle(second).opacity).toBe(held);
    second.dispatchEvent(new PointerEvent("pointerleave"));
    second.closest("[data-slot=live-surface]")?.dispatchEvent(new FocusEvent("focusin"));
  });

  it("stays finished and still under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(surface());
    releaseIdleCallbacks();
    await pause(SETTLE_MS * 2);
    expect(getComputedStyle(screen.getByText("Second").element()).opacity).toBe("1");
  });
});
