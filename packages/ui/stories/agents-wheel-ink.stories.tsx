import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { WheelInk } from "../src/agents/wheel-ink.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/WheelInk",
  component: WheelInk,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The method wheel's sumi stroke and its dots, internal to `MethodWheel`, whose course paints the stroke (`paintBrushStroke`, rasterised once by `inkImage`) and reveals it down the arc with the scroll. Before the course paints it, the stroke is empty; on phones and under reduced motion it stays hidden.",
      },
    },
  },
  args: { ink: "wheel-ink-story", dots: 3 },
  render: (args) => (
    <div className="relative h-48">
      <WheelInk {...args} />
    </div>
  ),
} satisfies Meta<typeof WheelInk>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unpainted: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-slot=wheel-marker]")).toHaveLength(3);
    await expect(canvasElement.querySelector("[data-wheel-ink]")).not.toHaveAttribute("href");
  },
};
