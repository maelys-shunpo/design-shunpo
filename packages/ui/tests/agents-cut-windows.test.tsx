import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { DocumentSheet } from "../src/agents/document-sheet.tsx";
import { OsViewPane } from "../src/agents/os-view.tsx";
import { OsWindow } from "../src/agents/os-window.tsx";
import { Direction } from "../src/layout/direction.tsx";
import {
  atDesktop,
  boxesUnder,
  cutOf,
  neverApprove,
  part,
  pointsOf,
  roundedElements,
  shadowOf,
} from "./support/agents-corners.ts";
import { osLabels, Windows } from "./support/agents-window-fixtures.tsx";

const RING_POINTS = 12;

beforeEach(atDesktop);

describe("Windows and cards", () => {
  it("cuts each window 20 px deep, its shadow following the cut", async () => {
    const screen = await render(<Windows />);
    const sheets = [
      "[data-slot=mock-window]",
      "[data-slot=task-composer]",
      "[data-slot=tool-tile]",
      "[data-slot=reference-tile]",
      "[data-converge-glimpse]",
    ].map((selector) => part(screen.container, selector));

    for (const sheet of sheets) {
      expect(sheet.className).toContain("agents-sheet");
      expect(cutOf(sheet)).toBe("20px");
      expect(shadowOf(sheet).boxShadow).toBe("none");
      expect(shadowOf(sheet).filter).toContain("drop-shadow");
    }
    expect(roundedElements(screen.container)).toEqual([]);
  });

  it("rings a window's hairline over its title bar, so no bar paints into the cut", async () => {
    const screen = await render(<Windows />);

    for (const selector of ["[data-slot=mock-window]", "[data-converge-glimpse]"]) {
      const sheet = part(screen.container, selector);
      const before = getComputedStyle(sheet, "::before");
      expect(before.zIndex).toBe("auto");
      expect(pointsOf(before.clipPath)).toBe(RING_POINTS);
    }
  });

  it("prints the supplier's document without a hairline", async () => {
    const screen = await render(
      <Direction name="agents">
        <DocumentSheet
          issuer="Métallerie"
          address="Lyon"
          kind="Facture"
          reference="F-1184"
          date="12/11"
          lines={[{ label: "Acier", amount: "120 €" }]}
          total="144 €"
        />
      </Direction>,
    );
    const sheet = part(screen.container, "[data-slot=document-sheet]");

    expect(cutOf(sheet)).toBe("20px");
    expect(getComputedStyle(sheet, "::before").backgroundColor).toBe(
      getComputedStyle(sheet, "::after").backgroundColor,
    );
    expect(roundedElements(screen.container)).toEqual([]);
  });

  it("lays no box inside a window", async () => {
    const screen = await render(<Windows />);
    await screen.getByRole("button", { name: "Saisir les factures" }).click();
    await expect.element(screen.getByText("Plan : factures")).toBeVisible();
    const plan = part(screen.container, "[data-slot=composer-plan]");
    const view = await render(
      <Direction name="agents">
        <OsViewPane
          view={{
            area: "today",
            label: "Ce matin",
            brief: "Le week-end.",
            figures: [{ label: "Encaissé", value: "12 k€" }],
            journal: [],
          }}
          decisions={[]}
          approved={[]}
          onApprove={neverApprove}
          labels={osLabels}
        />
      </Direction>,
    );
    const pane = part(view.container, "[data-slot=os-view]");

    expect(boxesUnder(plan)).toEqual([]);
    expect(boxesUnder(pane)).toEqual([]);
    expect(getComputedStyle(plan).borderTopWidth).toBe("1px");
  });

  it("keeps the composer's request bubble cut on the visitor's side", async () => {
    const screen = await render(<Windows />);
    await screen.getByRole("button", { name: "Saisir les factures" }).click();
    await expect.element(screen.getByText("Plan : factures")).toBeVisible();
    const bubble = part(screen.container, "output > span");

    expect(bubble.className).toContain("agents-sheet-night");
    expect(cutOf(bubble)).toBe("10px");
    expect(getComputedStyle(bubble, "::before").clipPath).not.toMatch(/^polygon\(10px 0px/u);
  });

  it("rings focus square, outside any clip", async () => {
    const screen = await render(
      <Direction name="agents">
        <OsWindow
          views={[{ area: "today", label: "Ce matin", brief: "Brief.", figures: [], journal: [] }]}
          decisions={[]}
          questions={[]}
          fallback={{ id: "autre", ask: "", keywords: [], answer: "Inconnu.", sources: [] }}
          labels={osLabels}
        />
      </Direction>,
    );
    const tab = screen.getByRole("tab", { name: /Ce matin/u }).element();

    expect(tab.closest(".agents-sheet-clip")).toBeNull();
  });
});
