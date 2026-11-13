import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { PanScene } from "../src/agents/pan-scene.tsx";
import { DESKTOP, PHONE } from "./support/viewports.ts";

function Scene() {
  return (
    <PanScene lead={<h2>Le texte</h2>}>
      <p>Le prototype</p>
    </PanScene>
  );
}

describe("PanScene on a desktop", () => {
  beforeEach(async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
  });

  it("lays the lead and the piece side by side, the piece running past the window's right edge", async () => {
    const screen = await render(<Scene />);
    const lead = screen.getByText("Le texte").element().getBoundingClientRect();
    const piece = screen.getByText("Le prototype").element().getBoundingClientRect();

    expect(piece.left).toBeGreaterThan(lead.left);
    expect(piece.left).toBeGreaterThan(window.innerWidth / 2);
  });

  it("holds its stage under the floating header for longer than a window", async () => {
    const screen = await render(<Scene />);
    const scene = screen.container.querySelector("[data-slot=scroll-scene]");

    expect(scene).not.toBeNull();
    expect(scene?.getBoundingClientRect().height).toBeGreaterThan(window.innerHeight * 2);
  });
});

describe("PanScene on a phone", () => {
  beforeEach(async () => {
    await page.viewport(PHONE.width, PHONE.height);
  });

  it("stacks the lead over the piece, no horizontal travel", async () => {
    const screen = await render(<Scene />);
    const lead = screen.getByText("Le texte").element().getBoundingClientRect();
    const piece = screen.getByText("Le prototype").element().getBoundingClientRect();

    expect(piece.top).toBeGreaterThan(lead.bottom);
    expect(piece.left).toBeLessThan(window.innerWidth);
  });
});
