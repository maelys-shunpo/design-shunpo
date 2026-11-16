import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { MecaniqueLink } from "../src/mecanique/mecanique-link.tsx";

const meta = {
  title: "Mécanique/MecaniqueLink",
  component: MecaniqueLink,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: { href: "#diagnostic", children: "Réserver un diagnostic" },
} satisfies Meta<typeof MecaniqueLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Réserver un diagnostic" })).toHaveAttribute(
      "href",
      "#diagnostic",
    );
  },
};

export const Outline: Story = { args: { variant: "outline", children: "Voir les réalisations" } };

export const Quiet: Story = {
  args: { variant: "quiet", size: "lg", children: "Toutes les réalisations" },
};
