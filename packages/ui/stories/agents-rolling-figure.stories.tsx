import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { RollingFigure } from "../src/agents/rolling-figure.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/RollingFigure",
  component: RollingFigure,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "A key figure whose digits roll like a counter once idle and in view: each digit's column rolls a full turn and stops on its value, left to right, while the other signs fade up. On the curved wall it rolls again each time its card comes to the front (`--ring-voice`). Readers hear the figure whole; reduced motion keeps it painted.",
      },
    },
  },
  args: { figure: "+1,4", unit: "M" },
} satisfies Meta<typeof RollingFigure>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KeyFigure: Story = {
  play: async ({ canvasElement }) => {
    const reading = canvasElement.querySelector("[data-slot=rolling-figure] .sr-only");
    await expect(reading?.textContent).toBe("+1,4 M");
    await expect(
      canvasElement.querySelector("[data-slot=rolling-figure] [aria-hidden=true]"),
    ).not.toBeNull();
  },
};
