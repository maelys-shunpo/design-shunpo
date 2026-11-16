import "../src/styles/globals.css";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Headline } from "../src/agents/headline.tsx";
import { QuestionNight } from "../src/agents/question-night.tsx";
import { ReferenceTile } from "../src/agents/reference-tile.tsx";
import { Testimonial } from "../src/agents/testimonial.tsx";
import { Direction } from "../src/layout/direction.tsx";

const PAPER_LIGHT = "rgb(250, 249, 246)";
const FIBRES = /^url\(.*agents-fibres.*\.webp/u;
const GRAIN = /^url\(.*agents-grain.*\.webp/u;

/* The styles of an element's layer (itself or a pseudo-element), empty when the element is missing. */
function layerOf(container: HTMLElement, selector: string, pseudo?: string) {
  const element = container.querySelector(selector);
  if (element === null) {
    return { image: "", blend: "", colour: "", mix: "", layer: "" };
  }
  const style = getComputedStyle(element, pseudo);
  return {
    image: style.backgroundImage,
    blend: style.backgroundBlendMode,
    colour: style.backgroundColor,
    mix: style.mixBlendMode,
    layer: style.zIndex,
  };
}

describe("Paper cards", () => {
  it("prints a client's words on a sheet of fibrous washi, cut on the bias", async () => {
    const screen = await render(
      <Direction name="agents">
        <Testimonial
          quote="Ils ont tenu leurs promesses."
          author="Simon Brossard"
          position="Chief Business Officer, lemlist"
          initials="SB"
        />
      </Direction>,
    );
    const sheet = layerOf(screen.container, "[data-slot=testimonial]", "::after");

    expect(sheet.image).toMatch(FIBRES);
    expect(sheet.blend).toBe("hard-light");
    expect(sheet.colour).toBe(PAPER_LIGHT);
  });

  it("sets a client's name on the same fibrous paper", async () => {
    const screen = await render(
      <Direction name="agents">
        <ReferenceTile name="lemlist" material="paper" />
      </Direction>,
    );
    const tile = layerOf(screen.container, "[data-slot=reference-tile]");

    expect(tile.image).toMatch(FIBRES);
    expect(tile.blend).toBe("hard-light");
    expect(tile.colour).toBe(PAPER_LIGHT);
  });

  it("stirs a film grain in the problem's night, under the question", async () => {
    const plate = {
      icon: "time",
      title: "Des outils",
      text: "Qui ne se parlent pas.",
    } as const;
    const screen = await render(
      <Direction name="agents">
        <QuestionNight
          question={<Headline level={2}>Vos outils suivent-ils ?</Headline>}
          plates={[
            plate,
            { ...plate, title: "Deux" },
            { ...plate, title: "Trois" },
            { ...plate, title: "Quatre" },
          ]}
        />
      </Direction>,
    );
    const grain = layerOf(screen.container, "[data-question-night]", "::before");

    expect(grain.image).toMatch(GRAIN);
    expect(grain.mix).toBe("overlay");
    expect(grain.layer).toBe("-1");
  });
});
