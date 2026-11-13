import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

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
          "Testimonial is a client's words, signed: initials, name and role above, the quote below, an optional source under it, no network badge, on a white card whose top right corner is cut on the bias like the actions. TestimonialCascade shows the cards two by two, stepping from one edge to the other from tablets up, the pairs landing in turn in a loop with a pause control and one dot per pair: the pair shown sinks and fades, then each new card comes down from a step above, tilted, and settles as its flight shadow melts into its own. Reduced motion swaps them at once.",
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
    <TestimonialCascade
      label="Avis de clients"
      labels={{ pages: ["Avis 1 et 2", "Avis 3"], pause: "Pause", play: "Lecture" }}
      every={60_000}
    >
      {[
        <Testimonial key="a" {...args} />,
        <Testimonial key="b" {...args} author="Simon Brossard" initials="SB" tone="ink" />,
        <Testimonial key="c" {...args} author="Corentin Lambert" initials="CL" tone="cobalt" />,
      ]}
    </TestimonialCascade>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Avis 3" }));
    /* The pair lands. */
    await waitFor(async () => {
      await expect(canvas.getByText("Corentin Lambert")).toBeVisible();
    });
  },
};
