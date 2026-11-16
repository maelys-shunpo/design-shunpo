import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentsFooter } from "../src/agents/agents-footer.tsx";
import { NavAnchor } from "../src/agents/nav-anchor.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const links = ["Cas clients", "Blog", "Contact"].map((label) => (
  <NavAnchor key={label} href="#">
    {label}
  </NavAnchor>
));

const legal = (
  <>
    <span>© 2026 SHUNPO · agents IA, automatisations et logiciels sur mesure</span>
    <NavAnchor href="#">Mentions légales</NavAnchor>
  </>
);

const meta = {
  title: "Agents/AgentsFooter",
  component: AgentsFooter,
  decorators: [inAgents],
  parameters: { layout: "fullscreen" },
  args: { links, place: "Lyon, France", legal },
} satisfies Meta<typeof AgentsFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

/* The home page's footer: a hairline carries the links and the place, the SHUNPO mark rises from behind it, the fine
   print rests at the foot. In a story everything is in view, so the mark is painted in place. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("SHUNPO")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Cas clients" })).toBeInTheDocument();
    await expect(canvas.getByText("Lyon, France")).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Mentions légales" })).toBeInTheDocument();
    /* « L'horizon » carries no email: the footer signs, it does not open a second way to write. */
    await expect(canvas.queryByText(/@/u)).not.toBeInTheDocument();
  },
};
