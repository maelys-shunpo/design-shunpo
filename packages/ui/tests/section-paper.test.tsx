import "../src/styles/globals.css";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Direction } from "../src/layout/direction.tsx";
import { Section } from "../src/layout/section.tsx";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";

const SHIRO = "rgb(229, 223, 211)";
const KOME = "rgb(243, 240, 233)";
const WASHI = /^url\(.*agents-washi.*\.webp/u;
const FROISSE = /^url\(.*agents-froisse.*\.webp/u;
const PLIE = /^url\(.*agents-plie.*\.webp/u;
const GRAIN = /^url\(.*agents-grain.*\.webp/u;

afterEach(async () => {
  await allowMotion();
});

/* The ground a section paints: its picture, how the picture meets its colour, and the colour. */
function groundOf(element: Element) {
  const style = getComputedStyle(element);
  return {
    image: style.backgroundImage,
    blend: style.backgroundBlendMode,
    colour: style.backgroundColor,
  };
}

/* The film grain a section lays over its ground, under its content. */
function grainOf(element: Element) {
  const style = getComputedStyle(element, "::before");
  return {
    image: style.backgroundImage,
    blend: style.mixBlendMode,
    animation: style.animationName,
    layer: style.zIndex,
  };
}

describe("Section paper", () => {
  it("stays plain paper by default", async () => {
    const screen = await render(
      <Direction name="agents">
        <Section aria-label="Shiro" tone="muted">
          Une section Shiro
        </Section>
      </Direction>,
    );

    expect(groundOf(screen.getByRole("region", { name: "Shiro" }).element())).toEqual({
      image: "none",
      blend: "normal",
      colour: SHIRO,
    });
  });

  it("lays the folds of a crumpled washi over its own colour", async () => {
    const screen = await render(
      <Direction name="agents">
        <Section aria-label="Washi" tone="muted" paper="washi">
          Une section sur washi
        </Section>
      </Direction>,
    );
    const ground = groundOf(screen.getByRole("region", { name: "Washi" }).element());

    expect(ground.image).toMatch(WASHI);
    expect(ground.blend).toBe("hard-light");
    expect(ground.colour).toBe(SHIRO);
  });

  it("crumples its paper, keeping its colour", async () => {
    const screen = await render(
      <Direction name="agents">
        <Section aria-label="Froissé" tone="muted" paper="froisse">
          Une section froissée
        </Section>
      </Direction>,
    );
    const ground = groundOf(screen.getByRole("region", { name: "Froissé" }).element());

    expect(ground.image).toMatch(FROISSE);
    expect(ground.blend).toBe("hard-light");
    expect(ground.colour).toBe(SHIRO);
  });

  it("unfolds one large sheet on the page's own paper when it has no colour of its own", async () => {
    const screen = await render(
      <Direction name="agents">
        <Section aria-label="Plié" paper="plie">
          Une section pliée
        </Section>
      </Direction>,
    );
    const ground = groundOf(screen.getByRole("region", { name: "Plié" }).element());

    expect(ground.image).toMatch(PLIE);
    expect(ground.blend).toBe("hard-light");
    expect(ground.colour).toBe(KOME);
  });

  it("stirs a film grain over a dark island, under its content", async () => {
    const screen = await render(
      <Direction name="agents">
        <Section aria-label="Grain" scheme="dark" paper="grain">
          Une île sombre
        </Section>
      </Direction>,
    );
    const section = screen.getByRole("region", { name: "Grain" }).element();
    const grain = grainOf(section);

    expect(grain.image).toMatch(GRAIN);
    expect(grain.blend).toBe("overlay");
    expect(grain.animation).toBe("agents-grain");
    expect(grain.layer).toBe("-1");
    expect(getComputedStyle(section).position).toBe("relative");
  });

  it("keeps the grain still under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(
      <Direction name="agents">
        <Section aria-label="Grain" scheme="dark" paper="grain">
          Une île sombre
        </Section>
      </Direction>,
    );
    const grain = grainOf(screen.getByRole("region", { name: "Grain" }).element());

    expect(grain.image).toMatch(GRAIN);
    expect(grain.animation).toBe("none");
  });
});
