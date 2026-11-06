import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { ReferenceLine } from "../src/origami/reference-line.tsx";

const meta = {
  title: "Origami/ReferenceLine",
  component: ReferenceLine,
  decorators: [
    (Story) => (
      <Direction name="origami">
        <div className="p-8">
          <Story />
        </div>
      </Direction>
    ),
  ],
  args: {
    href: "#tf1",
    name: "TF1",
    project: "Application de jeu d’une émission en prime time",
    stake: "Trafic massif et montée en charge en direct",
  },
} satisfies Meta<typeof ReferenceLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {
  play: async ({ canvas, userEvent }) => {
    const link = canvas.getByRole("link", { name: /TF1/u });
    await userEvent.hover(link);
    await expect(link).toHaveAttribute("href", "#tf1");
  },
};
