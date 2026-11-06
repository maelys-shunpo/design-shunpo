import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ShunpoLogo } from "../src/brand/shunpo-logo.tsx";

const meta = {
  title: "Brand/ShunpoLogo",
  component: ShunpoLogo,
} satisfies Meta<typeof ShunpoLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("SHUNPO")).toBeInTheDocument();
  },
};
export const Large: Story = { args: { size: "lg" } };
export const Small: Story = { args: { size: "sm", label: "SHUNPO, accueil" } };
