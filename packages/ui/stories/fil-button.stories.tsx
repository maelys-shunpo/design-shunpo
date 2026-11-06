import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilButton } from "../src/fil/fil-button.tsx";
import { Inline } from "../src/layout/inline.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilButton",
  component: FilButton,
  decorators: [inFilDirection],
  args: { href: "#diagnostic", children: "Réserver un diagnostic" },
} satisfies Meta<typeof FilButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ink: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Réserver un diagnostic" })).toHaveAttribute(
      "href",
      "#diagnostic",
    );
  },
};

export const Tones: Story = {
  render: (args) => (
    <Inline gap="md">
      <FilButton {...args} tone="ink" />
      <FilButton {...args} tone="red" size="lg" />
      <FilButton {...args} tone="outline" />
    </Inline>
  ),
};
