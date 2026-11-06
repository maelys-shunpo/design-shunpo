import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { OrigamiStage } from "../src/motion/origami-stage.tsx";
import { plainPoster } from "./support/plain-scene.tsx";

const meta = {
  title: "Origami/OrigamiStage",
  component: OrigamiStage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The studio of the Origami direction: a sheet folds into a paper plane that takes off, then the camera travels to a crane, a masu box and a boat that fold as it arrives, and a flock crosses the wide shot, as progress runs from 0 to 1. Ambient: the paper floats and the key light circles.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Direction name="origami">
        <Story />
      </Direction>
    ),
  ],
  args: { poster: plainPoster("Une feuille de papier à plat"), progress: { value: 0 } },
} satisfies Meta<typeof OrigamiStage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sheet: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Une feuille de papier à plat" }),
    ).toBeInTheDocument();
  },
};

export const Box: Story = { args: { progress: { value: 0.7 } } };
