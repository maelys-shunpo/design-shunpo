import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { PanScene } from "../src/agents/pan-scene.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/PanScene",
  component: PanScene,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "A section that travels sideways with the scroll: held under the floating header from tablets up, its lead and its piece on one row wider than the window, slid until the piece fills the stage, centred. Stacked, with no travel, on phones and under reduced motion.",
      },
    },
  },
  args: {
    lead: <h2>On crée le cerveau de votre entreprise</h2>,
    children: <p>Une fenêtre qui arrive de la droite.</p>,
  },
} satisfies Meta<typeof PanScene>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Travelling: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("On crée le cerveau de votre entreprise")).toBeVisible();
    await expect(canvas.getByText("Une fenêtre qui arrive de la droite.")).toBeVisible();
  },
};
