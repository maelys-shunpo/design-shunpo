import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilSection } from "../src/fil/fil-section.tsx";
import { FilTitle } from "../src/fil/fil-title.tsx";
import { Container } from "../src/layout/container.tsx";
import { Direction } from "../src/layout/direction.tsx";

const meta = {
  title: "Fil/FilSection",
  component: FilSection,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="fil">
        <Story />
      </Direction>
    ),
  ],
  args: {
    thread: "left",
    children: (
      <Container>
        <FilTitle level={2} size="display">
          Une bande de couleur
        </FilTitle>
      </Container>
    ),
  },
} satisfies Meta<typeof FilSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Kome: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-fil-thread='left']")).not.toBeNull();
  },
};
export const Tenku: Story = { args: { ground: "tenku", thread: "right" } };
export const Fuji: Story = { args: { ground: "fuji", thread: "end", spacing: "lg" } };
export const ShiroWithoutThread: Story = {
  render: ({ children }) => <FilSection ground="shiro">{children}</FilSection>,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-fil-thread]")).toBeNull();
  },
};
export const Entering: Story = { args: { thread: "enter" } };
