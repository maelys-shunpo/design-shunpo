import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { CoverSheet } from "../src/agents/cover-sheet.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { Section } from "../src/layout/section.tsx";
import { DESKTOP } from "./support/viewports.ts";

const KOME = "rgb(243, 240, 233)";
const SHIRO = "rgb(229, 223, 211)";
const WASHI = /^url\(.*agents-washi.*\.webp/u;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

function sheet(paper?: "plain" | "washi") {
  return (
    <Direction name="agents">
      <CoverSheet paper={paper}>
        <Section aria-label="Papier">Sur la feuille</Section>
        <Section aria-label="Shiro" tone="muted">
          Une section Shiro
        </Section>
        <Section aria-label="Nuit" scheme="dark">
          Une île sombre
        </Section>
      </CoverSheet>
    </Direction>
  );
}

/* The ground an element paints: its picture, how the picture meets its colour, and the colour. */
function groundOf(element: Element | null) {
  if (element === null) {
    return { image: "", blend: "", colour: "" };
  }
  const style = getComputedStyle(element);
  return {
    image: style.backgroundImage,
    blend: style.backgroundBlendMode,
    colour: style.backgroundColor,
  };
}

describe("CoverSheet", () => {
  it("stays plain paper by default", async () => {
    const screen = await render(sheet());

    await expect.element(screen.getByText("Sur la feuille")).toBeVisible();
    expect(groundOf(screen.container.querySelector("[data-slot=cover-sheet]"))).toEqual({
      image: "none",
      blend: "normal",
      colour: KOME,
    });
  });

  it("lays washi on its paper and on its Shiro sections, keeping their colour, and leaves dark islands smooth", async () => {
    const screen = await render(sheet("washi"));
    const paper = groundOf(screen.container.querySelector("[data-slot=cover-sheet]"));
    const shiro = groundOf(screen.getByRole("region", { name: "Shiro" }).element());
    const night = groundOf(screen.getByRole("region", { name: "Nuit" }).element());

    expect(paper.image).toMatch(WASHI);
    expect(paper.blend).toBe("hard-light");
    expect(paper.colour).toBe(KOME);
    expect(shiro.image).toMatch(WASHI);
    expect(shiro.blend).toBe("hard-light");
    expect(shiro.colour).toBe(SHIRO);
    expect(night.image).toBe("none");
  });
});
