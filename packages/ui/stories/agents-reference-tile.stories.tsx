import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ReferenceTile } from "../src/agents/reference-tile.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Reference tile",
  component: ReferenceTile,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "ReferenceTile is a client in the references wall: their logo, or their name set like a wordmark.",
      },
    },
  },
  args: { name: "TF1", detail: "Application de jeu d’une émission en prime time", size: "lg" },
} satisfies Meta<typeof ReferenceTile>;

export default meta;

type Story = StoryObj<typeof meta>;

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
