import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { AgentTabs } from "../src/agents/agent-tabs.tsx";
import type { ComposerScenario } from "../src/agents/composer-plan.tsx";
import { TaskComposer } from "../src/agents/task-composer.tsx";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await allowMotion();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await allowMotion();
});

const items = [
  { id: "a", title: "Répondre", description: "Support.", panel: <p>Panneau A</p> },
  { id: "b", title: "Relancer", description: "Commercial.", panel: <p>Panneau B</p> },
];

describe("AgentTabs", () => {
  it("advances by itself while in view, and holds under the pointer", async () => {
    const screen = await render(<AgentTabs label="Agents" items={items} every={400} />);
    /* The pointer may rest where an earlier test left it: tabs hold under it. */
    await userEvent.unhover(screen.getByRole("tablist"));
    await expect.element(screen.getByText("Panneau A")).toBeVisible();
    await expect.element(screen.getByText("Panneau B"), { timeout: 3000 }).toBeVisible();

    await screen.getByRole("tab", { name: /Répondre/u }).click();
    await screen.getByRole("tablist").hover();
    await pause(900);
    await expect.element(screen.getByText("Panneau A")).toBeVisible();
    await userEvent.unhover(screen.getByRole("tablist"));
  });

  it("never advances under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(<AgentTabs label="Agents" items={items} every={200} />);
    await pause(SETTLE_MS * 2);
    await expect.element(screen.getByText("Panneau A")).toBeVisible();
  });
});

const scenario: ComposerScenario = {
  id: "factures",
  label: "Saisir les factures",
  keywords: ["factur"],
  request: "Saisir les factures",
  title: "Plan : factures",
  steps: [
    { action: "Lire la boîte", tool: "Gmail" },
    { action: "Créer la facture", tool: "Odoo" },
  ],
  human: "Valider.",
};
const fallback: ComposerScenario = { ...scenario, id: "autre", title: "Plan : à préciser" };

function composer() {
  return (
    <TaskComposer
      scenarios={[scenario]}
      fallback={fallback}
      label="Décrivez une tâche"
      placeholder="Une tâche"
      submit="Voir le plan"
      humanLabel="Reste à l’équipe :"
    />
  );
}

describe("TaskComposer", () => {
  it("answers a typed task with the matching plan, or the fallback, and ignores an empty one", async () => {
    const screen = await render(composer());
    await screen.getByRole("button", { name: "Voir le plan" }).click();
    expect(screen.container.querySelector("[data-slot=composer-plan]")).toBeNull();

    await screen
      .getByRole("textbox", { name: "Décrivez une tâche" })
      .fill("Nos factures fournisseurs");
    await screen.getByRole("button", { name: "Voir le plan" }).click();
    await expect.element(screen.getByText("Plan : factures")).toBeVisible();
    await expect.element(screen.getByText("Nos factures fournisseurs")).toBeVisible();

    await screen.getByRole("textbox", { name: "Décrivez une tâche" }).fill("Classer les photos");
    await screen.getByRole("button", { name: "Voir le plan" }).click();
    await expect.element(screen.getByText("Plan : à préciser")).toBeVisible();
  });

  it("shows the whole plan at once under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(composer());
    await screen.getByRole("button", { name: "Saisir les factures" }).click();
    await expect.element(screen.getByText(/Valider\./u)).toBeVisible();
  });
});
