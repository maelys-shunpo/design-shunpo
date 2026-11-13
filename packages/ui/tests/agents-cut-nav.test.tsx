import "../src/styles/globals.css";
import { siGmail } from "simple-icons";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { AgentsNav } from "../src/agents/nav.tsx";
import { PhotoStage } from "../src/agents/photo-stage.tsx";
import type { ToolMark } from "../src/agents/tool-hub-layout.ts";
import { ToolHub } from "../src/agents/tool-hub.tsx";
import { Direction } from "../src/layout/direction.tsx";
import {
  atDesktop,
  cutOf,
  nth,
  part,
  roundedElements,
  shadowOf,
} from "./support/agents-corners.ts";

const POLYGON = /^polygon/u;

beforeEach(atDesktop);

describe("Nav, stages and tiles", () => {
  it("cuts the nav 14 px once it floats, and shows nothing while flat", async () => {
    const screen = await render(
      <Direction name="agents">
        <AgentsNav label="Navigation" brand={<span>marque</span>} links={null} action={null} />
        <div className="h-screen" />
        <div className="h-screen" />
        <div className="h-screen" />
      </Direction>,
    );
    const bar = screen.getByRole("navigation", { name: "Navigation" }).element();

    expect(getComputedStyle(bar, "::before").opacity).toBe("0");
    expect(getComputedStyle(bar, "::after").opacity).toBe("0");
    expect(shadowOf(bar).filter).toBe("none");
    window.scrollTo(0, 400);
    await expect.poll(() => getComputedStyle(bar, "::before").opacity).toBe("1");
    expect(cutOf(bar)).toBe("14px");
    expect(getComputedStyle(bar, "::after").opacity).toBe("1");
    expect(roundedElements(screen.container)).toEqual([]);
    window.scrollTo(0, 0);
  });

  it("cuts a photographed stage 32 px and clips the photograph along it", async () => {
    const screen = await render(
      <Direction name="agents">
        <PhotoStage backdrop={<span />}>
          <p>Interface</p>
        </PhotoStage>
      </Direction>,
    );
    const stage = part(screen.container, "[data-slot=photo-stage]");

    expect(cutOf(stage)).toBe("32px");
    expect(getComputedStyle(stage).clipPath).toMatch(POLYGON);
    expect(getComputedStyle(stage, "::before").content).toBe("none");
    expect(roundedElements(screen.container)).toEqual([]);
  });

  it("cuts the hub tiles at the action's depth, the owner's own slot square and dashed", async () => {
    const yours: ToolMark = {
      ...siGmail,
      slug: "votre-logiciel",
      title: "Votre logiciel",
      yours: true,
    };
    const columns = { left: [siGmail], right: [yours] };
    const screen = await render(
      <Direction name="agents">
        <ToolHub
          desk={columns}
          phone={columns}
          label="Vos outils"
          sealLabel="Votre agent"
          labels={{ pause: "Pause", play: "Lecture" }}
        >
          <span>Vos outils</span>
        </ToolHub>
      </Direction>,
    );
    const tile = nth(screen.container, "[data-slot=hub-tile]", 0);
    const slot = nth(screen.container, "[data-slot=hub-tile]", 1);

    expect(cutOf(tile)).toBe("10px");
    expect(getComputedStyle(tile, "::before").clipPath).toMatch(POLYGON);
    expect(getComputedStyle(slot).borderTopStyle).toBe("dashed");
    expect(getComputedStyle(slot, "::before").content).toBe("none");
    expect(roundedElements(screen.container)).toEqual([]);
  });
});
