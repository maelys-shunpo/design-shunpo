import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { Inline } from "../src/layout/inline.tsx";
import { OrigamiLink } from "../src/origami/origami-link.tsx";

const meta = {
  title: "Origami/OrigamiLink",
  component: OrigamiLink,
  decorators: [
    (Story) => (
      <Direction name="origami">
        <div className="p-8">
          <Story />
        </div>
      </Direction>
    ),
  ],
  args: { href: "#diagnostic", children: "Réserver un diagnostic" },
} satisfies Meta<typeof OrigamiLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  play: async ({ canvas, userEvent }) => {
    const link = canvas.getByRole("link", { name: /Réserver un diagnostic/u });
    await userEvent.hover(link);
    await expect(link).toHaveAttribute("href", "#diagnostic");
  },
};

export const Variants: Story = {
  render: (args) => (
    <Inline gap="md">
      <OrigamiLink {...args} />
      <OrigamiLink {...args} variant="outline">
        Voir les expertises
      </OrigamiLink>
      <OrigamiLink {...args} variant="quiet">
        Méthode
      </OrigamiLink>
    </Inline>
  ),
};
