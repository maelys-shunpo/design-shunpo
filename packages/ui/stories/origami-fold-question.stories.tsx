import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { FoldQuestion } from "../src/origami/fold-question.tsx";

const meta = {
  title: "Origami/FoldQuestion",
  component: FoldQuestion,
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
    question: "Nous avons déjà beaucoup de logiciels.",
    children: "Tant mieux. Souvent, la valeur vient de connecter ce qui existe.",
  },
} satisfies Meta<typeof FoldQuestion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unfolds: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Nous avons déjà beaucoup de logiciels."));
    await expect(canvas.getByText(/Tant mieux/u)).toBeVisible();
  },
};
