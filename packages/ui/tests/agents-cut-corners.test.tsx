import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Avatar } from "../src/agents/avatar.tsx";
import { Chip } from "../src/agents/chip.tsx";
import { StatusPill } from "../src/agents/status-pill.tsx";
import { TextField } from "../src/agents/text-field.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { atDesktop, atPhone, cutOf, part, roundedElements } from "./support/agents-corners.ts";

beforeEach(atDesktop);

describe("Square corners", () => {
  it("squares chips, statuses and fields, and keeps avatars round", async () => {
    const screen = await render(
      <Direction name="agents">
        <Chip>Relancer</Chip>
        <StatusPill tone="done">Fait</StatusPill>
        <TextField label="Votre demande" />
        <Avatar initials="SB" />
      </Direction>,
    );
    const avatar = part(screen.container, "[data-slot=avatar]");

    expect(roundedElements(screen.container)).toEqual([]);
    expect(getComputedStyle(avatar).borderTopLeftRadius).not.toBe("0px");
  });

  it("mirrors the cut to the top left", async () => {
    const screen = await render(
      <Direction name="agents">
        <div className="agents-sheet agents-sheet-left agents-sheet-xs" />
      </Direction>,
    );
    const sheet = part(screen.container, ".agents-sheet");

    expect(getComputedStyle(sheet, "::before").clipPath).toMatch(/^polygon\(10px 0px/u);
  });

  it("folds a note's corner in the shade of its paper", async () => {
    const screen = await render(
      <Direction name="agents">
        <div className="agents-sheet agents-sheet-fold agents-sheet-wait agents-sheet-lg" />
      </Direction>,
    );
    const note = part(screen.container, ".agents-sheet");
    const after = getComputedStyle(note, "::after");

    expect(cutOf(note)).toBe("16px");
    expect(after.backgroundImage).toContain("linear-gradient");
    expect(after.backgroundImage).toContain("rgb(224, 198, 194)");
  });

  it("scales the tile cut from tablets", async () => {
    const screen = await render(
      <Direction name="agents">
        <div className="agents-sheet agents-sheet-2xs" />
      </Direction>,
    );
    const tile = part(screen.container, ".agents-sheet");

    expect(cutOf(tile)).toBe("10px");
  });

  it("keeps the tile cut at 8 px on phones", async () => {
    await atPhone();
    const screen = await render(
      <Direction name="agents">
        <div className="agents-sheet agents-sheet-2xs" />
      </Direction>,
    );

    expect(cutOf(part(screen.container, ".agents-sheet"))).toBe("8px");
  });
});
