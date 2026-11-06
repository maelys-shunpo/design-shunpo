import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentTabs } from "../src/agents/agent-tabs.tsx";
import { CaseCard } from "../src/agents/case-card.tsx";
import { CaseRing } from "../src/agents/case-ring.tsx";
import type { ComposerScenario } from "../src/agents/composer-plan.tsx";
import { FaqItem } from "../src/agents/faq-item.tsx";
import { TaskComposer } from "../src/agents/task-composer.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const scenario: ComposerScenario = {
  id: "factures",
  label: "Saisir les factures",
  keywords: ["factur"],
  request: "Saisir les factures",
  title: "Plan : factures",
  steps: [
    { action: "Lire la boîte compta", tool: "Gmail" },
    { action: "Créer la facture", tool: "Odoo" },
  ],
  human: "Valider les gros montants.",
};

const meta = {
  title: "Agents/Interactive",
  component: AgentTabs,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "AgentTabs walks the agents with a progress bar and stops under the pointer. CaseRing bends the reference posters (CaseCard) on a curved wall that turns with the scroll. TaskComposer lets the visitor name a task and answers with a scripted plan. FaqItem is a native disclosure.",
      },
    },
  },
  args: {
    label: "Choisir un agent",
    every: 60_000,
    items: [
      {
        id: "a",
        title: "Répondre aux clients",
        description: "Avec ses sources.",
        panel: <p>Agent support</p>,
      },
      {
        id: "b",
        title: "Qualifier et relancer",
        description: "Dans le CRM.",
        panel: <p>Agent commercial</p>,
      },
    ],
  },
} satisfies Meta<typeof AgentTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tabs: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: /Qualifier/u }));
    await expect(canvas.getByText("Agent commercial")).toBeVisible();
  },
};

export const Cases: Story = {
  render: () => (
    <CaseRing
      label="Projets"
      items={[
        <CaseCard
          key="a"
          href="#a"
          client="TF1"
          project="Application"
          stake="Montée en charge"
          action="Lire"
          tone="ink"
        />,
        <CaseCard
          key="b"
          href="#b"
          client="Altaroc"
          project="Plateforme"
          stake="Fiabilité"
          action="Lire"
          tone="signal"
        />,
        <CaseCard
          key="c"
          href="#c"
          client="lemlist"
          project="Affiliation"
          stake="Automatisations"
          action="Lire"
        />,
        <CaseCard
          key="d"
          href="#d"
          client="Vicat"
          project="Web"
          stake="SEO"
          action="Lire"
          tone="cobalt"
        />,
        <CaseCard
          key="e"
          href="#e"
          client="Ops Clean"
          project="E-commerce"
          stake="Infrastructure"
          action="Lire"
          tone="sand"
        />,
      ]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toHaveLength(5);
  },
};

export const Composer: Story = {
  render: () => (
    <TaskComposer
      scenarios={[scenario]}
      fallback={{ ...scenario, id: "autre", title: "Plan : à préciser" }}
      label="Décrivez une tâche"
      placeholder="Ex. : recopier les bons de commande"
      submit="Voir le plan"
      humanLabel="Ce qui reste à votre équipe :"
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Saisir les factures" }));
    /* The agent thinks for a beat before it answers. */
    await expect(await canvas.findByText("Plan : factures", {}, { timeout: 3000 })).toBeVisible();
  },
};

export const Question: Story = {
  render: () => <FaqItem question="Nous avons déjà beaucoup de logiciels." answer="Tant mieux." />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Nous avons déjà beaucoup de logiciels."));
    await expect(canvas.getByText("Tant mieux.")).toBeVisible();
  },
};
