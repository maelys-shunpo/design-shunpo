import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { SpecLabel } from "../src/mecanique/spec-label.tsx";

const meta = {
  title: "Mécanique/SpecLabel",
  component: SpecLabel,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: { children: "Relevé 01 · Le constat", rule: true, tone: "signal" },
} satisfies Meta<typeof SpecLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Signal: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Relevé 01 · Le constat")).toBeVisible();
  },
};

export const Muted: Story = { args: { tone: "muted", rule: false, children: "Exemple" } };
