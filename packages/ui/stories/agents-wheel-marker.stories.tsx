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
          "A dot of the method wheel: an imperfect round of sumi ink (`blotImage`), each index printed with its own blot. The wheel's course places it on the ink, lands it once the brush reaches it (`data-landed`), sets it twice the stroke's width and the current one half as large again (`data-active`) and keeps the passed ones on the ink as they rise (`data-passed`). Shown from tablets up with motion.",
      },
    },
  },
  render: () => (
    <div className="flex gap-16 p-16">
      <div className="relative size-16">
        <WheelMarkerDot data-landed />
      </div>
      <div className="relative size-16">
        <WheelMarkerDot index={1} data-landed data-active />
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
    await expect(dots[0]).toHaveAttribute("data-landed");
    await expect(dots[1]).toHaveAttribute("data-landed");
    await expect(dots[1]).toHaveAttribute("data-active");
  },
};
