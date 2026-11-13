import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { ClosingCoupe } from "../src/agents/closing-coupe.tsx";
import { CoupeStage } from "../src/motion/coupe-stage.tsx";
import { inAgents } from "./support/agents-direction.tsx";
import { LIVE_TIMEOUT } from "./support/live-timeout.ts";
import { plainPoster } from "./support/plain-scene.tsx";

const meta = {
  title: "Agents/Closing coupe",
  component: ClosingCoupe,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The closing call reached by a cut. The SHUNPO shuriken is thrown across the whole page and leaves, a hairline holds for a beat, then the page gives: the two halves fall apart and uncover the closing on plain Fuji Night. From tablets up and with motion, a canvas plays the cut over the night and the call that wait behind it; phones and reduced motion read that night and its call directly, whole.",
      },
    },
  },
  args: {
    children: (
      <div className="flex flex-col items-center gap-8">
        <h2 className="text-center font-display text-6xl text-balance text-foreground">
          Le dernier logiciel dont vous aurez besoin
        </h2>
        <a href="#parler" className="font-display text-lg text-foreground underline">
          Parlons de votre projet
        </a>
      </div>
    ),
  },
} satisfies Meta<typeof ClosingCoupe>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closing: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Parlons de votre projet" })).toBeVisible();
  },
};

/* The cut's canvas on its own, part of the way open: the page still mostly whole, the two halves falling away. */
export const Cut: StoryObj<typeof CoupeStage> = {
  render: () => (
    <div style={{ position: "relative", width: 480, height: 300, background: "#1e2629" }}>
      <CoupeStage poster={plainPoster("La page encore entière")} progress={{ value: 0.6 }} />
    </div>
  ),
  play: async ({ canvasElement, userEvent }) => {
    /* The stage never takes the pointer, so the click lands on the frame behind it; a first interaction loads the
       scene on light devices, then its canvas appears over the poster. */
    await userEvent.click(canvasElement);
    await waitFor(() => expect(canvasElement.querySelector("canvas")).not.toBeNull(), LIVE_TIMEOUT);
  },
};
