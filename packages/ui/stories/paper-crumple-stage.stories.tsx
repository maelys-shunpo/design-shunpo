import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { PaperCrumpleStage } from "../src/motion/paper-crumple-stage.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Motion/PaperCrumpleStage",
  component: PaperCrumpleStage,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The 404's sheet: a crumpling three.js paper under the message. The canvas sits in an aria-hidden layer (the game is decorative), so the keyboard and screen readers reach the title and the home call directly. Under reduced motion or without WebGL2 the flat poster shows with the copy, no canvas. The crumple and the aria-hidden canvas are exercised by the page's e2e, where a real browser runs WebGL.",
      },
    },
  },
  args: {
    children: (
      <div>
        <h1>Cette page n’existe pas.</h1>
        <a href="#home">Revenir à l’accueil</a>
      </div>
    ),
  },
} satisfies Meta<typeof PaperCrumpleStage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sheet: Story = {
  play: async ({ canvas }) => {
    /* The message is real HTML laid over the sheet, reachable without the decorative game. */
    await expect(canvas.getByRole("heading", { level: 1 })).toBeInTheDocument();
    await expect(canvas.getByRole("link", { name: "Revenir à l’accueil" })).toBeInTheDocument();
  },
};
