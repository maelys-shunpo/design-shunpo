import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { DimensionLine } from "../src/mecanique/dimension-line.tsx";

const meta = {
  title: "Mécanique/DimensionLine",
  component: DimensionLine,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: { label: "Op. 01" },
} satisfies Meta<typeof DimensionLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Muted: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Op. 01")).toBeVisible();
    await expect(canvasElement.querySelectorAll("[data-scene-item=dimension-half]")).toHaveLength(
      2,
    );
  },
};

export const Signal: Story = { args: { tone: "signal", label: "Fig. 1 · Calibre SHUNPO" } };
