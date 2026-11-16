import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { BlueprintFrame } from "../src/mecanique/blueprint-frame.tsx";
import { Text } from "../src/typography/text.tsx";

const meta = {
  title: "Mécanique/BlueprintFrame",
  component: BlueprintFrame,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: {
    padding: "lg",
    children: <Text>Calibre 01 : intelligence artificielle et automatisation.</Text>,
  },
} satisfies Meta<typeof BlueprintFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-slot=blueprint-frame] > [aria-hidden]"),
    ).toHaveLength(4);
  },
};

export const Raised: Story = { args: { tone: "raised", padding: "md" } };
