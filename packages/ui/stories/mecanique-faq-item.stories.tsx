import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { FaqItem } from "../src/mecanique/faq-item.tsx";

const meta = {
  title: "Mécanique/FaqItem",
  component: FaqItem,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: {
    index: "01",
    question: "Nous avons déjà beaucoup de logiciels.",
    answer: "Tant mieux. Souvent, la valeur vient de connecter et d’améliorer ce qui existe.",
  },
} satisfies Meta<typeof FaqItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(/Tant mieux/u)).not.toBeVisible();
    await userEvent.click(canvas.getByText("Nous avons déjà beaucoup de logiciels."));
    await expect(canvas.getByText(/Tant mieux/u)).toBeVisible();
  },
};

export const Open: Story = { args: { open: true, size: "md" } };
