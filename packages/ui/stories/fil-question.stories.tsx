import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilQuestion } from "../src/fil/fil-question.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilQuestion",
  component: FilQuestion,
  decorators: [inFilDirection],
  args: {
    question: "Nous avons déjà beaucoup de logiciels.",
    answer: "Souvent, la valeur vient de connecter et d’améliorer ce qui existe.",
  },
} satisfies Meta<typeof FilQuestion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OpensOnClick: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Nous avons déjà beaucoup de logiciels."));
    await expect(canvas.getByText(/connecter et d’améliorer/u)).toBeVisible();
  },
};
