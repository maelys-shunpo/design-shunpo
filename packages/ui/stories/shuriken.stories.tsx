import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Shuriken } from "../src/brand/shuriken.tsx";
import { Inline } from "../src/layout/inline.tsx";

const meta = {
  title: "Brand/Shuriken",
  component: Shuriken,
  args: { size: "lg" },
} satisfies Meta<typeof Shuriken>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Badges: Story = {
  render: (args) => (
    <Inline gap="md">
      <Shuriken {...args} tone="signal" label="SHUNPO, rouge" />
      <Shuriken {...args} tone="paper" label="SHUNPO, beige" />
      <Shuriken {...args} tone="night" label="SHUNPO, nuit" />
    </Inline>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: "SHUNPO, rouge" })).toBeVisible();
  },
};

export const Glyph: Story = { args: { tone: "glyph", size: "sm" } };
