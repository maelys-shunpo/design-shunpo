import "../src/styles/globals.css";
import { siQuickbooks } from "simple-icons";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { OsDecisionCard } from "../src/agents/os-decision.tsx";
import type { OsDecision } from "../src/agents/os-model.ts";
import { Direction } from "../src/layout/direction.tsx";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

const decision: OsDecision = {
  id: "payer",
  area: "finance",
  title: "Payer Métallerie Rhône-Alpes",
  detail: "Facture F-2026-1184 · 4 812,60 € TTC",
  reason: "Au-delà de votre seuil de 2 000 €",
  action: "Payer la facture",
  follow: { at: "08:05", tool: siQuickbooks, text: "Paiement programmé" },
};

function doneCard() {
  return (
    <Direction name="agents">
      <OsDecisionCard
        decision={decision}
        decided
        note="Fait. La ligne est au journal."
        onApprove={() => {}}
      />
    </Direction>
  );
}

function cardOf(container: HTMLElement): HTMLElement {
  const card = container.querySelector<HTMLElement>("[data-slot=os-decision]");
  if (card === null) {
    throw new Error("no decision card");
  }
  return card;
}

afterEach(async () => {
  await allowMotion();
});

describe("OsDecisionCard done", () => {
  it("settles done with its check drawing instead of snapping in", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(doneCard());

    const card = cardOf(screen.container);
    expect(card.className).toContain("agents-decided");
    expect(card.querySelector("[data-decided-check]")).not.toBeNull();
    expect(getComputedStyle(card).animationName).toBe("agents-settle-in");
  });

  it("paints the done card at once under reduced motion", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    await preferReducedMotion();
    const screen = await render(doneCard());

    expect(getComputedStyle(cardOf(screen.container)).animationName).toBe("none");
  });
});
