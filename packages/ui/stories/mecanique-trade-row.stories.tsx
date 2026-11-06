import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { TradeRow } from "../src/mecanique/trade-row.tsx";

const meta = {
  title: "Mécanique/TradeRow",
  component: TradeRow,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <dl>
          <Story />
        </dl>
      </Direction>
    ),
  ],
  args: { instead: "Un agent IA", outcome: "Des tâches prises en charge sans vous" },
} satisfies Meta<typeof TradeRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Large: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("term")).toHaveTextContent("Un agent IA");
    await expect(canvas.getByRole("definition")).toHaveTextContent("sans vous");
  },
};

export const Medium: Story = { args: { size: "md" } };
