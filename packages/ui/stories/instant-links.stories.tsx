import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { InkLink } from "../src/instant/ink-link.tsx";
import { SealLink } from "../src/instant/seal-link.tsx";
import { Inline } from "../src/layout/inline.tsx";
import { inInstant } from "./support/instant-direction.tsx";

const meta = {
  title: "Instant/SealLink",
  component: SealLink,
  decorators: [inInstant],
  parameters: {
    docs: {
      description: {
        component:
          "The primary action of the Instant direction: a seal of flat ink with square corners. On hover the label and the arrow leave upwards while their copies arrive from below, in one step. InkLink is its quiet companion: a link on a faint rule, inked from the left on hover.",
      },
    },
  },
  args: { href: "#contact", label: "Réserver un diagnostic" },
} satisfies Meta<typeof SealLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Seal: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Réserver un diagnostic" })).toHaveAttribute(
      "href",
      "#contact",
    );
  },
};

export const Tones: Story = {
  render: (args) => (
    <Inline gap="lg">
      <SealLink {...args} size="sm" />
      <SealLink {...args} />
      <SealLink {...args} tone="ink" size="lg" />
      <InkLink href="#references">Voir les références</InkLink>
    </Inline>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Voir les références" })).toHaveAttribute(
      "href",
      "#references",
    );
    await expect(canvas.getAllByRole("link", { name: "Réserver un diagnostic" })).toHaveLength(3);
  },
};
