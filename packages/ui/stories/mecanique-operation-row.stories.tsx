import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { OperationRow } from "../src/mecanique/operation-row.tsx";

const meta = {
  title: "Mécanique/OperationRow",
  component: OperationRow,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <ol>
          <Story />
        </ol>
      </Direction>
    ),
  ],
  args: {
    index: "Op. 01",
    title: "Assembler",
    detail: "Vos outils existants trouvent leur place. Nous relions avant d’ajouter.",
  },
} satisfies Meta<typeof OperationRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Roomy: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toHaveTextContent("Assembler");
  },
};

export const Compact: Story = { args: { density: "compact" } };

export const Adaptive: Story = { args: { density: "adaptive" } };

export const WithoutDetail: Story = { args: { detail: undefined } };
