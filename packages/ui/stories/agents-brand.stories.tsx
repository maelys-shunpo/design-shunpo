import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentsAction } from "../src/agents/action.tsx";
import { Eyebrow } from "../src/agents/eyebrow.tsx";
import { HeadlinePart } from "../src/agents/headline-part.tsx";
import { Headline } from "../src/agents/headline.tsx";
import { Wordmark } from "../src/agents/wordmark.tsx";
import { Inline } from "../src/layout/inline.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Brand",
  component: Wordmark,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The « Agents » direction's voice: a lowercase wordmark beside a signal square, mono eyebrows, light headlines whose context words stay grey (HeadlinePart), ink actions (AgentsAction) and a bar that floats as a pill once the visitor scrolls (AgentsNav, NavAnchor).",
      },
    },
  },
} satisfies Meta<typeof Wordmark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Marks: Story = {
  render: () => (
    <Stack gap="lg">
      <Wordmark />
      <Wordmark size="lg" />
      <Inline gap="lg">
        <Eyebrow>Signal</Eyebrow>
        <Eyebrow tone="cobalt">Cobalt</Eyebrow>
        <Eyebrow tone="ink" as="span">
          Encre
        </Eyebrow>
      </Inline>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText("SHUNPO")).toHaveLength(2);
  },
};

export const Headlines: Story = {
  render: () => (
    <Stack gap="lg">
      <Headline level={1} size="hero">
        <HeadlinePart tone="dim" block>
          Des agents IA
        </HeadlinePart>
        <HeadlinePart block>qui font le travail,</HeadlinePart>
        <HeadlinePart tone="dim">pas la </HeadlinePart>
        <HeadlinePart tone="ink">démo.</HeadlinePart>
      </Headline>
      <Headline level={2} size="subtitle" align="center">
        Un titre centré
      </Headline>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("démo.");
  },
};

export const Actions: Story = {
  render: () => (
    <Inline gap="sm">
      <AgentsAction href="#contact" size="lg">
        Réserver un diagnostic
      </AgentsAction>
      <AgentsAction href="#agents" variant="outline">
        Voir un agent
      </AgentsAction>
      <AgentsAction href="#cas" variant="quiet">
        Lire le cas
      </AgentsAction>
    </Inline>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Réserver un diagnostic" })).toHaveAttribute(
      "href",
      "#contact",
    );
  },
};
