import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { TestimonialCascade } from "../src/agents/testimonial-cascade.tsx";
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
          "Testimonial is a client's words, signed: initials, name and role above, the quote below, an optional source under it, no network badge. TestimonialCascade steps the cards from one edge to the other from tablets up.",
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

export const Cascade: Story = {
  render: (args) => (
    <TestimonialCascade label="Avis de clients">
      <Testimonial {...args} />
      <Testimonial {...args} author="Simon Brossard" initials="SB" tone="ink" />
    </TestimonialCascade>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};
