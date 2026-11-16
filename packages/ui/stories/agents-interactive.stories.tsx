import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentTabs } from "../src/agents/agent-tabs.tsx";
import { CaseCard } from "../src/agents/case-card.tsx";
import { CaseWall } from "../src/agents/case-wall.tsx";
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
          "AgentTabs walks the agents with a progress bar and stops under the pointer. CaseWall is the references wall: three cards (CaseCard, each with its key figure, tinted per client) on an arc that settles once as it comes into view; the pointer folds a card's corner and swaps its figure for its mission. TaskComposer lets the visitor name a task and answers with a scripted plan. FaqItem is a native disclosure.",
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

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

const caseCards = [
  <CaseCard
    key="a"
    href="#a"
    client="TF1"
    tint="kurenai"
    figure="1,4"
    unit="M"
    figureLabel="de téléspectateurs ont joué avec l’application"
    mission="L’application de jeu d’une émission en prime time, conçue pour tenir un trafic massif en direct."
    image={<img src={PIXEL} alt="" />}
    action="Lire le cas client"
  />,
  <CaseCard
    key="b"
    href="#b"
    client="Altaroc"
    tint="tenku"
    figure="1,6"
    unit="Md€"
    figureLabel="d’actifs suivis sur la plateforme"
    mission="Une plateforme d’investissement qui manie des données sensibles avec une exigence de fiabilité."
    image={<img src={PIXEL} alt="" />}
    action="Lire le cas client"
  />,
  <CaseCard
    key="c"
    href="#c"
    client="lemlist"
    tint="shiro"
    figure="5"
    unit="M$"
    figureLabel="de revenus récurrents par an"
    mission="Une plateforme d’affiliation qui combine outils web et automatisations."
    image={<img src={PIXEL} alt="" />}
    action="Lire le cas client"
  />,
];

export const Cases: Story = {
  render: () => (
    <CaseWall
      label="Projets publiés"
      title={<h2>Ce qu’ont gagné nos clients</h2>}
      items={caseCards}
      action={<a href="#tous">Voir tous les projets</a>}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole("link", { name: /Lire le cas client/u })).toHaveLength(3);
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: /Voir tous les projets/u })).toBeVisible();
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
