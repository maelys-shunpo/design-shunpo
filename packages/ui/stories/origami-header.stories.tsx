import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { Inline } from "../src/layout/inline.tsx";
import { OrigamiHeader } from "../src/origami/origami-header.tsx";
import { OrigamiLink } from "../src/origami/origami-link.tsx";
import { Wordmark } from "../src/origami/wordmark.tsx";

const meta = {
  title: "Origami/OrigamiHeader",
  component: OrigamiHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="origami">
        <Story />
      </Direction>
    ),
  ],
  args: {
    brand: <Wordmark />,
    navigation: (
      <Inline as="ul" gap="lg">
        <li>
          <OrigamiLink href="#methode" variant="quiet">
            Méthode
          </OrigamiLink>
        </li>
      </Inline>
    ),
    action: (
      <OrigamiLink href="#contact" variant="outline">
        Diagnostic
      </OrigamiLink>
    ),
  },
} satisfies Meta<typeof OrigamiHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Header: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Diagnostic/u })).toBeVisible();
  },
};
