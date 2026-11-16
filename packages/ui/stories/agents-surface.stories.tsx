import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Surface } from "../src/agents/surface.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Surface",
  component: Surface,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "A cut paper panel that carries content: one 45° cut at the top right, a paper fill, an optional drop shadow that follows the cut. The design system's general « sheet laid on the page », used by the 404 and anywhere content sits on its own paper.",
      },
    },
  },
  args: { children: "Une feuille posée sur la page." },
} satisfies Meta<typeof Surface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WhitePaper: Story = {
  args: { paper: "paper", cut: "lg", shadow: "lift" },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Une feuille posée sur la page.")).toBeVisible();
    const surface = canvasElement.querySelector("[data-slot=surface]");
    await expect(surface).not.toBeNull();
    await expect(surface).toHaveClass(/agents-sheet/u);
  },
};
