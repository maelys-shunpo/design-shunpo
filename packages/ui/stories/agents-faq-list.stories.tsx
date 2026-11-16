import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { FaqList } from "../src/agents/faq-list.tsx";
import { Direction } from "../src/layout/direction.tsx";

/* A few of the page's objections, enough to read the asymmetric layout and open one. */
const items = [
  {
    id: "adapte",
    question: "Je ne sais pas si l’IA est adaptée à mon entreprise.",
    answer: "L’Immersion sert à repérer les cas d’usage utiles chez vous, et à écarter les autres.",
  },
  {
    id: "logiciels",
    question: "Nous avons déjà beaucoup de logiciels.",
    answer:
      "Souvent, la valeur vient de connecter et d’améliorer ce qui existe, sans tout remplacer.",
  },
  {
    id: "dependance",
    question: "Je ne veux pas dépendre d’un prestataire.",
    answer: "Documentation, transmission, formation : vos équipes comprennent et font évoluer.",
  },
];

const meta = {
  title: "Agents/FaqList",
  component: FaqList,
  decorators: [
    (Story) => (
      <Direction name="agents">
        <Story />
      </Direction>
    ),
  ],
  args: {
    title: "Les questions qu’on nous pose le plus.",
    items,
  },
} satisfies Meta<typeof FaqList>;

export default meta;

type Story = StoryObj<typeof meta>;

/* The list reads whole, each row closed. Opening one question (native disclosure) raises its answer. */
export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(/connecter et d’améliorer/u)).not.toBeVisible();
    await userEvent.click(canvas.getByText("Nous avons déjà beaucoup de logiciels."));
    await waitFor(() => expect(canvas.getByText(/connecter et d’améliorer/u)).toBeVisible());
  },
};
