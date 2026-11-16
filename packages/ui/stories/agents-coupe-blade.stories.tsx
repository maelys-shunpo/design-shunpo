import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { CoupeBlade } from "../src/agents/coupe-blade.tsx";
import { poseCoupeDom } from "../src/scene/coupe-dom-pose.ts";

/* The blade is controlled: it draws whatever pose it is handed. The story owns a `sceneProgress` and poses it, so the
   control scrubs the whole gesture, from the reading dwell through the throw to after the star has left. */
interface PreviewProps {
  sceneProgress: number;
}

function CoupeBladePreview({ sceneProgress }: PreviewProps) {
  return (
    <div
      className="relative overflow-clip bg-agents-paper"
      style={{ width: "640px", height: "360px" }}
    >
      <CoupeBlade pose={poseCoupeDom(sceneProgress)} />
    </div>
  );
}

function bladeStar(canvasElement: HTMLElement): SVGGElement | null {
  return canvasElement.querySelector<SVGGElement>("[data-coupe-blade-part=star]");
}

const meta = {
  title: "Agents/CoupeBlade",
  component: CoupeBladePreview,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The decorative blade layer of the coupe, in SVG: the SHUNPO shuriken thrown across the cut, its three trailing ghosts (the Shunpo Shift, fading back), and the hairline held from the entry edge to the star's head. Controlled by `pose` (`poseCoupeDom`); the scene poses it each frame over the FAQ. Fushimi Glow star, Fuji Night hairline.",
      },
    },
  },
  argTypes: {
    sceneProgress: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
  args: { sceneProgress: 0.37 },
} satisfies Meta<typeof CoupeBladePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/* The reading dwell, before the gesture: the FAQ is read whole, no blade on the page. */
export const Reading: Story = {
  args: { sceneProgress: 0.1 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-slot=coupe-blade]")).not.toBeNull();
    await expect(bladeStar(canvasElement)).toBeNull();
  },
};

/* Mid-throw: the star is on the page, placed on the cut, spinning across. */
export const MidThrow: Story = {
  args: { sceneProgress: 0.37 },
  play: async ({ canvasElement }) => {
    const star = bladeStar(canvasElement);
    await expect(star).not.toBeNull();
    await expect(star).toBeVisible();
    await expect(star?.getAttribute("transform")).toMatch(/translate/u);
  },
};

/* After the star has left: no shuriken on the page, the hairline holding through the beat. */
export const AfterExit: Story = {
  args: { sceneProgress: 0.45 },
  play: async ({ canvasElement }) => {
    await expect(bladeStar(canvasElement)).toBeNull();
    const hairline = canvasElement.querySelector<SVGLineElement>(
      "[data-coupe-blade-part=hairline]",
    );
    await expect(hairline).not.toBeNull();
    await expect(hairline).toBeVisible();
  },
};
