import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { Emphasis } from "../src/origami/emphasis.tsx";
import { Wordmark } from "../src/origami/wordmark.tsx";
import { Heading } from "../src/typography/heading.tsx";

const meta = {
  title: "Origami/Wordmark",
  component: Wordmark,
  decorators: [
    (Story) => (
      <Direction name="origami">
        <div className="p-8">
          <Story />
        </div>
      </Direction>
    ),
  ],
} satisfies Meta<typeof Wordmark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Small: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("hunpo")).toBeVisible();
  },
};

export const Large: Story = { args: { size: "xl" } };

export const FoldedWord: Story = {
  render: () => (
    <Heading level={2} size="display">
      Pliez le travail. <Emphasis>Dépliez</Emphasis> le temps.
    </Heading>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Dépliez").tagName).toBe("EM");
  },
};
