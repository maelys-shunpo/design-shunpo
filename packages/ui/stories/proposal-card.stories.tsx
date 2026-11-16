import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ProposalCard } from "../src/brand/proposal-card.tsx";

const meta = {
  title: "Brand/ProposalCard",
  component: ProposalCard,
  args: {
    direction: "instant",
    href: "#instant",
    index: "01",
    name: "Instant",
    tagline: "L’estampe et l’éclair.",
    technique: "Particules d’encre",
    action: "Voir la proposition",
  },
} satisfies Meta<typeof ProposalCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Instant: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Instant/u })).toHaveAttribute(
      "href",
      "#instant",
    );
  },
};
export const Mecanique: Story = {
  args: { direction: "mecanique", name: "Mécanique", href: "#mecanique" },
};
export const Fil: Story = { args: { direction: "fil", name: "Le fil", href: "#fil" } };
