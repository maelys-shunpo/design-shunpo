import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";

import { PhaseStack } from "../src/agents/phase-stack.tsx";
import { PhaseThread } from "../src/agents/phase-thread.tsx";
import { inAgents, PLATE } from "./support/agents-direction.tsx";

const items = [
  {
    id: "immersion",
    title: "Immersion",
    kicker: "5 jours auprès de vos équipes",
    description: "On suit votre équipe pour comprendre où le travail ralentit.",
    details: ["Carte des processus", "Heures perdues estimées", "Feuille de route priorisée"],
    panel: <p>Carte du flux</p>,
  },
  {
    id: "construction",
    title: "Construction",
    kicker: "Brique par brique",
    description: "On construit un premier flux et on le teste avec votre équipe.",
    details: ["Interface de suivi", "Outils connectés", "Agents configurés"],
    panel: <p>Flux factures</p>,
  },
  {
    id: "evolution",
    title: "Évolution",
    kicker: "Après la mise en service",
    description: "On regarde avec votre équipe ce qui se passe au quotidien.",
    details: ["Suivi des usages", "Maintenance des connexions", "Nouveaux flux"],
    panel: <p>Flux en production</p>,
  },
];

const backdrop = <img src={PLATE} alt="" />;

const meta = {
  title: "Agents/Method",
  component: PhaseStack,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "Two ways through the phases of a project. PhaseThread is an agent's plan: a thread from dot to dot, the current phase open with its deliverables ticking, the stage beside. PhaseStack is a deck: from tablets up with motion the cards share one place, each laid over the one before with its tab still showing; the page's scroll deals them.",
      },
    },
  },
  args: { label: "Les trois phases d’un projet", items, backdrop },
} satisfies Meta<typeof PhaseStack>;

export default meta;

type Story = StoryObj<typeof meta>;

function ThreadDemo() {
  const [active, setActive] = useState(0);
  return (
    <PhaseThread
      label="Les trois phases d’un projet"
      items={items}
      active={active}
      checked={items[active]?.details.length ?? 0}
      backdrop={backdrop}
      onSelect={setActive}
    />
  );
}

export const Thread: Story = {
  render: () => <ThreadDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Construction" }));
    await expect(canvas.getByText("Interface de suivi")).toBeVisible();
  },
};

export const Stack: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  },
};
