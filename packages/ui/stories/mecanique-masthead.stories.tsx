import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ShunpoLogo } from "../src/brand/shunpo-logo.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { Masthead } from "../src/mecanique/masthead.tsx";
import { MecaniqueLink } from "../src/mecanique/mecanique-link.tsx";
import { NavLink } from "../src/mecanique/nav-link.tsx";

const meta = {
  title: "Mécanique/Masthead",
  component: Masthead,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <Story />
      </Direction>
    ),
  ],
  args: {
    label: "Sections de la page",
    brand: <ShunpoLogo size="sm" />,
    navigation: (
      <li>
        <NavLink href="#methode" index="01">
          Méthode
        </NavLink>
      </li>
    ),
    action: <MecaniqueLink href="#diagnostic">Diagnostic</MecaniqueLink>,
  },
} satisfies Meta<typeof Masthead>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("banner")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Diagnostic" })).toBeVisible();
  },
};

export const Raised: Story = { args: { tone: "raised" } };
