import "../src/styles/globals.css";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { CaseCard } from "../src/agents/case-card.tsx";
import { CaseWall } from "../src/agents/case-wall.tsx";
import { DESKTOP, PHONE } from "./support/viewports.ts";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

function wall() {
  const clients = ["TF1", "Altaroc", "lemlist"] as const;
  return (
    <CaseWall
      label="Projets publiés"
      title={<h2>Ce qu’ont gagné nos clients</h2>}
      action={<a href="#tous">Voir tous les projets</a>}
      items={clients.map((client) => (
        <CaseCard
          key={client}
          href={`#${client}`}
          client={client}
          tint="tenku"
          figure="1"
          unit="M"
          figureLabel="mesuré"
          mission="Une mission."
          image={<img src={PIXEL} alt="" />}
          action="Lire le cas client"
        />
      ))}
    />
  );
}

/* Whether the middle top stands clearly above both sides, which stand level. */
function onAnArc([left = 0, middle = 0, right = 0]: number[]): boolean {
  return left - middle > 8 && right - middle > 8 && Math.abs(left - right) < 1;
}

/* The left edge of each card's slot, in pixels. */
function lefts(container: HTMLElement): number[] {
  return [...container.querySelectorAll("[data-wall-slot]")].map(
    (slot) => slot.getBoundingClientRect().left,
  );
}

/* Whether the second slot stands under the first, as a stacked list does. */
function stacked(container: HTMLElement): boolean {
  const [first, second] = container.querySelectorAll("[data-wall-slot]");
  return (second?.getBoundingClientRect().top ?? 0) > (first?.getBoundingClientRect().bottom ?? 0);
}

/* The top edge of each card's slot, in pixels. */
function tops(container: HTMLElement): number[] {
  return [...container.querySelectorAll("[data-wall-slot]")].map(
    (slot) => slot.getBoundingClientRect().top,
  );
}

describe("CaseWall", () => {
  it("lists the three projects under the title, then the way to all of them", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(wall());

    await expect.element(screen.getByRole("heading", { name: /nos clients/u })).toBeVisible();
    await expect.element(screen.getByRole("list", { name: "Projets publiés" })).toBeVisible();
    expect(screen.getByRole("listitem").elements()).toHaveLength(3);
    await expect.element(screen.getByRole("link", { name: "Voir tous les projets" })).toBeVisible();
  });

  it("settles on an arc: the print in the middle stands higher than the two beside it", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(wall());

    await expect.poll(() => onAnArc(tops(screen.container))).toBe(true);
  });

  it("stacks the prints on a phone, all at the same height of their column", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(wall());

    expect(new Set(lefts(screen.container)).size).toBe(1);
    expect(stacked(screen.container)).toBe(true);
  });
});
