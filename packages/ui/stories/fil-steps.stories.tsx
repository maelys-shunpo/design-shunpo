import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilStep } from "../src/fil/fil-step.tsx";
import { FilSteps } from "../src/fil/fil-steps.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilSteps",
  component: FilSteps,
  decorators: [inFilDirection],
  args: {
    children: ["Comprendre et auditer", "Concevoir et intégrer", "Accompagner et former"].map(
      (title, index) => (
        <FilStep
          key={title}
          index={`0${index + 1}`}
          title={title}
          detail="Ce que ce geste change pour vos équipes."
        />
      ),
    ),
  },
} satisfies Meta<typeof FilSteps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeSteps: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  },
};
