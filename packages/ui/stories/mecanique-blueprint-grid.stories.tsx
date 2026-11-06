import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { BlueprintGrid } from "../src/mecanique/blueprint-grid.tsx";
import { Text } from "../src/typography/text.tsx";

const meta = {
  title: "Mécanique/BlueprintGrid",
  component: BlueprintGrid,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: { children: <Text>Une section posée sur la planche à dessin.</Text> },
} satisfies Meta<typeof BlueprintGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Twelve: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-slot=blueprint-grid] > [aria-hidden] > span"),
    ).toHaveLength(12);
  },
};

export const Six: Story = { args: { columns: "6" } };
