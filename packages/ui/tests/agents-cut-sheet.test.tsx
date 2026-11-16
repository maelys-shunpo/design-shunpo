import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { ReferenceTile } from "../src/agents/reference-tile.tsx";
import { Testimonial } from "../src/agents/testimonial.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { atDesktop, cutOf, part, shadowOf } from "./support/agents-corners.ts";

const POLYGON = /^polygon/u;

beforeEach(atDesktop);

describe("The sheet", () => {
  it("cuts a testimonial 20 px deep and lifts it with a drop shadow", async () => {
    const screen = await render(
      <Direction name="agents">
        <Testimonial
          quote="Ils ont tenu leurs promesses."
          author="Simon Brossard"
          position="CBO, lemlist"
          initials="SB"
        />
      </Direction>,
    );
    const figure = part(screen.container, "[data-slot=testimonial]");

    expect(figure.className).toContain("agents-sheet");
    expect(cutOf(figure)).toBe("20px");
    expect(getComputedStyle(figure, "::before").clipPath).toMatch(POLYGON);
    expect(shadowOf(figure).filter).toContain("drop-shadow");
  });

  it("cuts a client's paper tile 14 px deep and clips its fibres along the cut", async () => {
    const screen = await render(
      <Direction name="agents">
        <ReferenceTile name="lemlist" material="paper" />
      </Direction>,
    );
    const tile = part(screen.container, "[data-slot=reference-tile]");

    expect(tile.className).toContain("agents-sheet");
    expect(cutOf(tile)).toBe("14px");
    expect(getComputedStyle(tile).clipPath).toMatch(POLYGON);
  });
});
