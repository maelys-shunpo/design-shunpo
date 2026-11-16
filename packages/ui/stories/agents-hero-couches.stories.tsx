import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siGooglesheets, siHubspot, siNotion, siOdoo, siShopify } from "simple-icons";
import { expect } from "storybook/test";

import { ApprovalCard } from "../src/agents/approval-card.tsx";
import { HeroCouches } from "../src/agents/hero-couches.tsx";
import { inAgents, PLATE } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Hero couches",
  component: HeroCouches,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Hero « Vue éclatée »: the promise above the SHUNPO interface, tipped back under the fold. Held over three screens from tablets up, the interface opens into three planes (you, the agents, your tools on a plaster slab), one task runs down the red thread into a tool and its result comes back up, then the planes close and the camera faces the interface. Phones and reduced motion read the planes one under the other, labelled, the routed task settled.",
      },
    },
  },
  args: {
    copy: <h1 className="text-center font-display text-5xl">Une interface pour vos outils</h1>,
    backdrop: <img src={PLATE} alt="" />,
    labels: {
      you: {
        index: "01 · Vous",
        title: "Vous validez ce qui compte",
        detail: "Une seule interface.",
      },
      agents: {
        index: "02 · Les agents",
        title: "Ils agissent dans vos outils",
        detail: "Un agent par process.",
      },
      tools: {
        index: "03 · Vos outils",
        title: "Rien à remplacer",
        detail: "Vos outils restent en place.",
      },
    },
    workspace: {
      title: "Espace de travail",
      context: "Back-office · Lyon",
      status: "En service",
      heading: "Aujourd’hui",
      tasks: [
        {
          icon: siGmail,
          text: "Facture F-2026-1184 lue et extraite",
          time: "09:42",
          tone: "done",
          status: "Fait",
        },
        {
          icon: siOdoo,
          text: "Brouillon créé dans Odoo",
          time: "09:43",
          tone: "working",
          status: "En cours",
          settled: "Fait",
        },
        {
          icon: siHubspot,
          text: "Relance du devis Durand préparée",
          time: "09:51",
          tone: "done",
          status: "Fait",
        },
      ],
      aside: "Attend votre validation",
      approval: (
        <ApprovalCard
          reason="Montant supérieur à 2 000 €"
          detail="Métallerie Rhône-Alpes · 4 812,60 € TTC"
          approve="Approuver"
          edit="Modifier"
        />
      ),
      approved: {
        reason: "Montant supérieur à 2 000 €",
        detail: "Métallerie Rhône-Alpes · 4 812,60 € TTC",
        outcome: "Approuvé par Claire M. · 09:44",
        initials: "CM",
      },
    },
    agents: [
      { name: "Agent factures", role: "Comptabilité fournisseurs", doing: "Prépare le brouillon" },
      { name: "Agent support", role: "Service client", doing: "Répond à un suivi" },
      { name: "Agent ventes", role: "Suivi commercial", doing: "Prépare une relance" },
    ],
    tools: [
      [siGmail, siOdoo],
      [siShopify, siNotion],
      [siHubspot, siGooglesheets],
    ],
    target: siOdoo.slug,
  },
} satisfies Meta<typeof HeroCouches>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Layers: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(canvas.getByText("Espace de travail")).toBeVisible();
    await expect(canvas.getByText("Approuvé par Claire M. · 09:44")).toBeInTheDocument();
  },
};
