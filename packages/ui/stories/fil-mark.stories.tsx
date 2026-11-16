import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilMark } from "../src/fil/fil-mark.tsx";
import { FilTitle } from "../src/fil/fil-title.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilMark",
  component: FilMark,
  decorators: [inFilDirection],
  args: { children: "fil" },
  render: (args) => (
    <FilTitle level={2} size="display">
      Tirons le premier <FilMark {...args} />.
    </FilTitle>
  ),
} satisfies Meta<typeof FilMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InAHeadline: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /Tirons le premier fil/u })).toBeVisible();
  },
};
