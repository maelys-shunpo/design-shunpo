import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { TestimonialDrift } from "../src/agents/testimonial-drift.tsx";
import { Testimonial } from "../src/agents/testimonial.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Testimonials",
  component: Testimonial,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "Testimonial is a client's words, signed: initials, name and role above, the quote below, an optional source under it, no network badge, on a white card whose top right corner is cut on the bias like the actions. TestimonialDrift lays the cards over three columns drifting from lg, the middle one against its neighbours (one row drifting left below it): the labelled group takes a tab stop, so the pointer over a column or keyboard focus holds every column, with no pause button. Reduced motion unfolds each column, every card whole and read once.",
      },
    },
  },
  args: {
    quote: "Entreprise très compétente et à l’écoute de nos demandes.",
    author: "Marc Biessy",
    position: "CEO, Ops Clean",
    initials: "MB",
    tone: "mint",
    source: "Avis publié sur shunpo.fr",
  },
} satisfies Meta<typeof Testimonial>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Card: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Marc Biessy")).toBeVisible();
  },
};

export const Drift: Story = {
  render: (args) => (
    <TestimonialDrift label="Avis de clients">
      {[
        <Testimonial key="a" {...args} />,
        <Testimonial
          key="b"
          {...args}
          author="Simon Brossard"
          position="CTO, Revoltrain"
          initials="SB"
          tone="ink"
        />,
        <Testimonial
          key="c"
          {...args}
          author="Corentin Lambert"
          position="Head of Ops, Insideo"
          initials="CL"
          tone="cobalt"
        />,
        <Testimonial
          key="d"
          {...args}
          author="Nadia Rahmani"
          position="COO, OpsClean"
          initials="NR"
          tone="warm"
        />,
        <Testimonial
          key="e"
          {...args}
          author="Paul Vernier"
          position="CEO, Fushimi"
          initials="PV"
          tone="mint"
        />,
        <Testimonial
          key="f"
          {...args}
          author="Léa Fontaine"
          position="CMO, Tenku"
          initials="LF"
          tone="ink"
        />,
      ]}
    </TestimonialDrift>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Avis de clients" })).toBeVisible();
  },
};
