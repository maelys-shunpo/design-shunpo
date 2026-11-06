import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { OrientationPicture } from "../src/instant/orientation-picture.tsx";
import { InstantStage } from "../src/motion/instant-stage.tsx";
import { inInstant } from "./support/instant-direction.tsx";
import { LIVE_TIMEOUT } from "./support/live-timeout.ts";

const PLATE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23e5dfd3'/%3E%3C/svg%3E";

const meta = {
  title: "Instant/InstantStage",
  component: InstantStage,
  decorators: [inInstant],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The signature of the Instant direction: ink particles hold a drawing, then jump to the next in an instant, trailed by ghosts, from a saturated week to scattered tools, one system and a week mostly free stamped with the red seal. progress (0 to 1) comes from the page's ScrollScene; the mouse parts the ink; the ink breathes, so the stage is ambient and gets a pause control.",
      },
    },
  },
  args: {
    progress: { value: 0 },
    pauseLabel: "Mettre l’animation en pause",
    playLabel: "Relancer l’animation",
    poster: (
      <OrientationPicture
        landscape={PLATE}
        portrait={{ src: PLATE, alt: "Une semaine pleine, à l’encre" }}
      />
    ),
  },
} satisfies Meta<typeof InstantStage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Week: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("img", { name: "Une semaine pleine, à l’encre" }));
    await expect(
      await canvas.findByRole("button", { name: "Mettre l’animation en pause" }, LIVE_TIMEOUT),
    ).toBeInTheDocument();
  },
};

export const TimeWithCopy: Story = {
  args: {
    progress: { value: 1 },
    children: <a href="#contact">Réserver un diagnostic</a>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Réserver un diagnostic" })).toBeVisible();
  },
};
