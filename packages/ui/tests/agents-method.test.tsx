import "../src/styles/globals.css";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { PhaseThread } from "../src/agents/phase-thread.tsx";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

const items = [
  {
    id: "a",
    title: "Immersion",
    kicker: "5 jours",
    description: "On observe.",
    details: ["Carte", "Heures", "Feuille de route"],
    panel: <p>Tableau A</p>,
  },
  { id: "b", title: "Construction", description: "On construit.", panel: <p>Tableau B</p> },
  { id: "c", title: "Évolution", description: "On suit.", panel: <p>Tableau C</p> },
];

const backdrop = <img alt="" />;

describe("PhaseThread", () => {
  it("opens the current phase, ticks its deliverables and draws the thread as they tick", async () => {
    const screen = await render(
      <PhaseThread
        label="Phases"
        items={items}
        active={0}
        checked={2}
        backdrop={backdrop}
        onSelect={vi.fn<(index: number) => void>()}
      />,
    );
    const current = screen.getByRole("listitem").filter({ hasText: "Immersion" }).first();
    await expect.element(current).toHaveAttribute("aria-current", "step");
    await expect.element(screen.getByText("On observe.")).toBeVisible();
    await expect.element(screen.getByText("On construit.")).not.toBeInTheDocument();
    await expect.element(screen.getByText("Tableau A")).toBeVisible();
    await expect.element(screen.getByText("Tableau B")).not.toBeVisible();
    const fill = current.element().querySelector<HTMLElement>(".agents-thread-segment > span");
    expect(fill?.style.scale).toBe("1 0.666667");
  });

  it("folds and fills a passed phase, waits on the next, and hands a click to the page", async () => {
    const onSelect = vi.fn<(index: number) => void>();
    const screen = await render(
      <PhaseThread
        label="Phases"
        items={items}
        active={1}
        checked={0}
        backdrop={backdrop}
        onSelect={onSelect}
      />,
    );
    const segments = screen.container.querySelectorAll<HTMLElement>(
      ".agents-thread-segment > span",
    );
    expect(segments[0]?.style.scale).toBe("1");
    expect(segments[1]?.style.scale).toBe("1 0");
    await expect.element(screen.getByText("On observe.")).not.toBeInTheDocument();
    await screen.getByRole("button", { name: "Évolution" }).click();
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
