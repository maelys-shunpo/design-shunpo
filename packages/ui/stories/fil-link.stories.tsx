import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilLink } from "../src/fil/fil-link.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilLink",
  component: FilLink,
  decorators: [inFilDirection],
  args: { href: "#cas", children: "Tous les cas clients" },
} satisfies Meta<typeof FilLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Tous les cas clients" })).toBeVisible();
  },
};
