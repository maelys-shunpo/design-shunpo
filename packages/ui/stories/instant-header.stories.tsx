import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ShunpoLogo } from "../src/brand/shunpo-logo.tsx";
import { InstantHeader } from "../src/instant/header.tsx";
import { InkLink } from "../src/instant/ink-link.tsx";
import { NavList } from "../src/instant/nav-list.tsx";
import { SealLink } from "../src/instant/seal-link.tsx";
import { inInstant } from "./support/instant-direction.tsx";

const meta = {
  title: "Instant/InstantHeader",
  component: InstantHeader,
  decorators: [inInstant],
  parameters: { layout: "fullscreen" },
  args: {
    brand: (
      <a href="#top">
        <ShunpoLogo size="sm" label="SHUNPO, retour en haut de la page" />
      </a>
    ),
    navigation: (
      <NavList>
        {["Expertises", "Méthode", "Références"].map((label) => (
          <li key={label}>
            <InkLink size="sm" href={`#${label}`}>
              {label}
            </InkLink>
          </li>
        ))}
      </NavList>
    ),
    action: <SealLink href="#contact" label="Réserver un diagnostic" size="sm" />,
  },
} satisfies Meta<typeof InstantHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Masthead: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("banner")).toBeInTheDocument();
    await expect(
      canvas.getByRole("link", { name: "SHUNPO, retour en haut de la page" }),
    ).toBeInTheDocument();
  },
};
