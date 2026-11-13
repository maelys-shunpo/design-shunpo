import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentsAction } from "../src/agents/action.tsx";
import { CoverSheet } from "../src/agents/cover-sheet.tsx";
import { HeroFilm } from "../src/agents/hero-film.tsx";
import { inAgents } from "./support/agents-direction.tsx";
import mp4 from "./support/rising-sun.mp4?url";
import webm from "./support/rising-sun.webm?url";

const NIGHT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%231e2629'/%3E%3C/svg%3E";

const meta = {
  title: "Agents/Hero film",
  component: HeroFilm,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The home page's hero in the « Agents » direction: a full-screen film read by the scroll behind the centred promise (piste A, « l'aube écrit la promesse »). The promise rises word by word from a still night, the dawn climbs its letters from the horizon, then the risen sun overexposes them from below and the last frame holds; the stage then stays under the `CoverSheet` that rises over it. Reduced motion: the still behind the promise.",
      },
    },
  },
  args: {
    sources: { mp4, webm },
    poster: <img src={NIGHT} alt="Le soleil se lève sur les montagnes" />,
    still: <img src={NIGHT} alt="Le soleil levé sur les montagnes" />,
    title: "On construit le système qui fait tourner votre entreprise, boosté à l’IA.",
    action: (
      <AgentsAction href="#contact" size="lg" arrow>
        Réserver une Immersion
      </AgentsAction>
    ),
    leaveAt: 0.75,
  },
} satisfies Meta<typeof HeroFilm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Night: Story = {
  render: (args) => (
    <main>
      <HeroFilm {...args} />
      <CoverSheet>
        <div className="h-svh" />
      </CoverSheet>
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    /* The scroll scene drives the action and the film; assert they are in the document, as the sibling hero stories do
       (their rest state is not guaranteed in the headless runner). */
    await expect(canvas.getByRole("link", { name: "Réserver une Immersion" })).toBeInTheDocument();
    await expect(canvas.getByAltText("Le soleil se lève sur les montagnes")).toBeInTheDocument();
  },
};
