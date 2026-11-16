import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { MecaniqueStage } from "../src/motion/mecanique-stage.tsx";
import { plainPoster } from "./support/plain-scene.tsx";

const meta = {
  title: "Mécanique/MecaniqueStage",
  component: MecaniqueStage,
  parameters: {
    docs: {
      description: {
        component:
          "The calibre of the Mécanique direction: a watch movement drawn in code, exploded, assembled, set running and closed by its dial as the page's progress runs from 0 to 1. Ambient while exploded.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: { poster: plainPoster("Calibre en vue éclatée"), progress: { value: 0 }, size: "md" },
} satisfies Meta<typeof MecaniqueStage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Exploded: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "Calibre en vue éclatée" })).toBeInTheDocument();
  },
};

export const Closed: Story = { args: { progress: { value: 1 }, size: "lg" } };
