import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { ReferenceRow } from "../src/mecanique/reference-row.tsx";

const meta = {
  title: "Mécanique/ReferenceRow",
  component: ReferenceRow,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: {
    href: "#altaroc",
    name: "Altaroc",
    project: "Plateforme d’investissement",
    stake: "Données sensibles et exigence de fiabilité",
  },
} satisfies Meta<typeof ReferenceRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "#altaroc");
  },
};
