import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  siGmail,
  siHubspot,
  siMake,
  siN8n,
  siNotion,
  siOdoo,
  siShopify,
  siStripe,
} from "simple-icons";
import { expect } from "storybook/test";

import { ConnectionHub } from "../src/agents/connection-hub.tsx";
import { ReferenceTile } from "../src/agents/reference-tile.tsx";
import { Shuriken } from "../src/brand/shuriken.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Connections",
  component: ConnectionHub,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "ConnectionHub wires the tools to one agent: the hub in the middle, the tools on two orbits (the near one only on phones), a Fushimi pulse running down one thread at a time while the line under the hub says what the agent did there. Still under reduced motion, off screen and under the pointer or focus. ReferenceTile is a client in the references wall: their logo, or their name set like a wordmark.",
      },
    },
  },
  args: {
    label: "Un agent relié à vos outils",
    hub: <Shuriken size="lg" />,
    near: [siGmail, siOdoo, siHubspot, siShopify],
    far: [siN8n, siMake, siNotion, siStripe],
    messages: [
      { tool: siGmail.slug, text: "A lu 3 factures fournisseurs" },
      { tool: siOdoo.slug, text: "A préparé 2 brouillons de facture" },
    ],
  },
} satisfies Meta<typeof ConnectionHub>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hub: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("figure", { name: "Un agent relié à vos outils" })).toBeVisible();
  },
};

export const References: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <ReferenceTile
        name="TF1"
        detail="Application de jeu d’une émission en prime time"
        size="lg"
      />
      <ReferenceTile name="lemlist" detail="Plateforme d’affiliation" size="lg" />
      <ReferenceTile name="1817 · Groupe Vicat" detail="Expérience web" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("lemlist")).toBeVisible();
  },
};
