import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siGooglesheets, siHubspot, siNotion, siOdoo, siShopify } from "simple-icons";
import { expect } from "storybook/test";

import { HeadlinePart } from "../src/agents/headline-part.tsx";
import { Headline } from "../src/agents/headline.tsx";
import { type ConvergeTool, HeroConvergence } from "../src/agents/hero-convergence.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const DONE: ConvergeTool["status"] = { tone: "done", label: "Fait" };

function tool(id: string, icon: ConvergeTool["icon"], task: string): ConvergeTool {
  return {
    id,
    icon,
    app: icon.title,
    context: "Ce matin",
    title: "Dossier en cours",
    detail: "À traiter",
    fields: [
      { label: "Étape", value: "Ouverte" },
      { label: "Reçu", value: "09:42" },
    ],
    task,
    meta: `${icon.title} · 09:42`,
    status: DONE,
  };
}

const tools: ConvergeTool[] = [
  tool("gmail", siGmail, "Facture lue, brouillon créé dans Odoo"),
  tool("hubspot", siHubspot, "Relance du devis envoyée"),
  {
    ...tool("odoo", siOdoo, "Facture au-dessus du seuil"),
    status: { tone: "waiting", label: "À valider", owner: "CM" },
  },
  tool("sheets", siGooglesheets, "Planning des chantiers mis à jour"),
  tool("shopify", siShopify, "Relivraison demandée"),
  tool("notion", siNotion, "Compte rendu rédigé"),
];

const meta = {
  title: "Agents/Hero Convergence",
  component: HeroConvergence,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Signature « Convergence »: the windows of a team's tools lie around the promise; the scroll flies each into its own row of one workspace, then the statuses turn. Phones and reduced motion show the copy, then the gathered workspace.",
      },
    },
  },
  args: {
    copy: (
      <Headline level={1} size="title" align="center">
        <HeadlinePart tone="dim">Une interface pour faire travailler </HeadlinePart>
        <HeadlinePart>vos outils ensemble</HeadlinePart>
      </Headline>
    ),
    workspace: {
      title: "Espace de travail",
      context: "SHUNPO · lundi matin",
      status: "En service",
    },
    tools,
    caption: "Six outils, une seule interface.",
  },
} satisfies Meta<typeof HeroConvergence>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeInTheDocument();
    await expect(canvas.getByRole("list", { name: "Espace de travail" })).toBeInTheDocument();
    await expect(canvas.getByText("À valider")).toBeInTheDocument();
  },
};
