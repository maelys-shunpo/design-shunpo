import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Eyebrow } from "../src/agents/eyebrow.tsx";
import { SectionTab } from "../src/agents/section-tab.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/SectionTab",
  component: SectionTab,
  decorators: [inAgents],
} satisfies Meta<typeof SectionTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Opener: Story = {
  render: () => (
    <Stack gap="md">
      <SectionTab />
      <Eyebrow tone="ink">Questions</Eyebrow>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-slot=section-tab]")).toBeInTheDocument();
  },
};

export const Centred: Story = {
  render: () => (
    <Stack gap="md" align="center">
      <SectionTab align="center" />
      <Eyebrow tone="ink" align="center">
        Références
      </Eyebrow>
    </Stack>
  ),
};
