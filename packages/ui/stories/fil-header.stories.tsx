import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilHeader } from "../src/fil/fil-header.tsx";
import { Direction } from "../src/layout/direction.tsx";

const meta = {
  title: "Fil/FilHeader",
  component: FilHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="fil">
        <div className="relative h-48">
          <Story />
        </div>
      </Direction>
    ),
  ],
  args: {
    homeHref: "/",
    links: [
      { href: "#probleme", label: "Le problème" },
      { href: "#methode", label: "Méthode" },
    ],
    action: { href: "#diagnostic", label: "Réserver un diagnostic", shortLabel: "Diagnostic" },
  },
} satisfies Meta<typeof FilHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "SHUNPO, accueil" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Réserver un diagnostic" })).toBeVisible();
  },
};
