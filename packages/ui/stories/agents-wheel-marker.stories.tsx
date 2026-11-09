import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { WheelMarkerDot } from "../src/agents/wheel-marker.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/WheelMarker",
  component: WheelMarkerDot,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "A dot of the method wheel: an imperfect round of sumi ink (`blotImage`), each index printed with its own blot. The wheel's course places it on the arc, grows the current phase's twice as large (`data-active`) and fades the passed ones (`data-passed`). Shown from tablets up with motion.",
      },
    },
  },
  render: () => (
    <div className="flex gap-16 p-16">
      <div className="relative size-16">
        <WheelMarkerDot />
      </div>
      <div className="relative size-16">
        <WheelMarkerDot index={1} data-active />
      </div>
    </div>
  ),
} satisfies Meta<typeof WheelMarkerDot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoBlots: Story = {
  play: async ({ canvasElement }) => {
    const dots = canvasElement.querySelectorAll("[data-slot=wheel-marker]");
    await expect(dots).toHaveLength(2);
    await expect(dots[1]).toHaveAttribute("data-active");
  },
};
