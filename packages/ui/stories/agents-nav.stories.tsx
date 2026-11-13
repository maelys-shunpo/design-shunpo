import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentsAction } from "../src/agents/action.tsx";
import { NavAnchor } from "../src/agents/nav-anchor.tsx";
import { AgentsNav } from "../src/agents/nav.tsx";
import { Wordmark } from "../src/agents/wordmark.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Nav",
  component: AgentsNav,
  decorators: [inAgents],
  args: { label: "Navigation principale", brand: null, links: null, action: null },
} satisfies Meta<typeof AgentsNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
  render: () => (
    <AgentsNav
      label="Navigation principale"
      brand={<Wordmark />}
      links={
        <>
          <NavAnchor href="#agents">Agents</NavAnchor>
          <NavAnchor href="#outils">Intégrations</NavAnchor>
        </>
      }
      action={<AgentsAction href="#contact">Réserver</AgentsAction>}
    />
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("navigation", { name: "Navigation principale" }),
    ).toBeInTheDocument();
  },
};

/* Over a hero film: out of the flow, in Kome on the night until the visitor scrolls and the pill floats. */
export const OverFilm: Story = {
  render: () => (
    <div className="h-svh bg-fuji">
      <AgentsNav
        label="Navigation principale"
        over="film"
        brand={<Wordmark />}
        links={<NavAnchor href="#methode">Méthode</NavAnchor>}
        action={<AgentsAction href="#contact">Parlons de votre projet</AgentsAction>}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("navigation", { name: "Navigation principale" })).toHaveClass(
      "scheme-dark",
    );
  },
};
