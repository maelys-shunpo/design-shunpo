import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siGooglesheets, siHubspot, siOdoo } from "simple-icons";
import { expect } from "storybook/test";

import { HeadlinePart } from "../src/agents/headline-part.tsx";
import { Headline } from "../src/agents/headline.tsx";
import { HeroPliage, type PliageTool } from "../src/agents/hero-pliage.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const tools: PliageTool[] = [
  { id: "messagerie", label: "Messagerie", icon: siGmail, paper: "white" },
  { id: "crm", label: "CRM", icon: siHubspot, paper: "shiro" },
  { id: "erp", label: "ERP", icon: siOdoo, paper: "frost" },
  { id: "tableur", label: "Tableur", icon: siGooglesheets, paper: "tenku" },
];

const meta = {
  title: "Agents/Hero Pliage",
  component: HeroPliage,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Hero « Pliage »: four sheets of paper, one per tool, lie beside the promise; the scroll folds each into a kite, gathers the kites into the SHUNPO star on its pebble, then turns it a quarter. Phones and reduced motion show the folded sign.",
      },
    },
  },
  args: {
    copy: (
      <Headline level={1} size="title">
        <HeadlinePart tone="dim">Vos outils, </HeadlinePart>
        <HeadlinePart>un seul système.</HeadlinePart>
      </Headline>
    ),
    tools,
    label:
      "Quatre feuilles de papier, une par outil, pliées en un seul signe : le shuriken SHUNPO.",
    caption: { before: "4 outils", after: "1 système" },
  },
} satisfies Meta<typeof HeroPliage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeInTheDocument();
    await expect(
      canvas.getAllByRole("img", { name: /pliées en un seul signe/u }).length,
    ).toBeGreaterThan(0);
    await expect(canvas.getAllByText("1 système").length).toBeGreaterThan(0);
  },
};
