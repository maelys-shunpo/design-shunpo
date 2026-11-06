import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilTitle } from "../src/fil/fil-title.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilTitle",
  component: FilTitle,
  decorators: [inFilDirection],
  args: { level: 2, children: "Chaque outil tire de son côté." },
} satisfies Meta<typeof FilTitle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = {
  args: { size: "display" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Chaque outil tire de son côté." }),
    ).toBeVisible();
  },
};

export const Mega: Story = { args: { size: "mega", align: "center", tone: "accent" } };
export const Pinned: Story = { args: { size: "title", pinned: true, tone: "muted" } };
