import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { NavLink } from "../src/mecanique/nav-link.tsx";

const meta = {
  title: "Mécanique/NavLink",
  component: NavLink,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: { href: "#references", index: "04", children: "Références" },
} satisfies Meta<typeof NavLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "04 Références" })).toBeVisible();
  },
};
