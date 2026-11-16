import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Arrival } from "../src/agents/arrival.tsx";
import { Headline } from "../src/agents/headline.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { Text } from "../src/typography/text.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Arrival",
  component: Arrival,
  decorators: [inAgents],
  args: { children: null },
  parameters: {
    docs: {
      description: {
        component:
          'Arrival wraps content that settles once the visitor reaches it. mode="follow" is the phrase and call under a title: they hold while the block waits to be seen, then rise a little and fade in on a delay that spans the title\'s rise, so they land just after its last line, one entrance in two beats. mode="block" is a whole card or list that rises once on its own as it comes into view. Both wait off screen and are painted in place under reduced motion. In a story everything is in view, so it is painted at once.',
      },
    },
  },
} satisfies Meta<typeof Arrival>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Follow: Story = {
  render: () => (
    <Stack gap="lg" align="start">
      <Headline level={2} size="title" align="start">
        Vos agents travaillent dans vos outils
      </Headline>
      <Arrival mode="follow">
        <Text size="lg" tone="muted" measure="prose" align="start">
          Quand un outil n’a pas de connecteur, nous le construisons.
        </Text>
      </Arrival>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/connecteur/u)).toBeVisible();
  },
};

export const Block: Story = {
  render: () => (
    <Arrival mode="block">
      <Text size="lg" align="start">
        Un bloc entier, une carte ou une liste, qui monte une fois en arrivant dans la vue.
      </Text>
    </Arrival>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/Un bloc entier/u)).toBeVisible();
  },
};
