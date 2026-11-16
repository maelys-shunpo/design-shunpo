import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siGooglesheets, siHubspot, siOdoo } from "simple-icons";
import { expect } from "storybook/test";

import { HeroShuriken } from "../src/agents/hero-shuriken.tsx";
import { AgentsShurikenStage } from "../src/motion/agents-shuriken-stage.tsx";
import { inAgents } from "./support/agents-direction.tsx";
import { plainPoster } from "./support/plain-scene.tsx";

const marks = [siGmail, siHubspot, siOdoo, siGooglesheets].map(({ title, path }) => ({
  title,
  path,
}));

const meta = {
  title: "Agents/Hero shuriken",
  component: HeroShuriken,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Hero « Le signe plié »: the promise on five columns, and beside it four sheets of paper, one per tool, that fold into points and lock into the SHUNPO sign on its Fushimi pebble, then turn a quarter in one step while the camera rises to face the sign. Held over three screens from tablets up; phones and reduced motion show the folded sign.",
      },
    },
  },
  args: {
    copy: <h1 className="font-display text-5xl">Vos outils, un seul système.</h1>,
    poster: plainPoster("Quatre feuilles de papier posées à plat"),
    folded: plainPoster("Les quatre feuilles pliées en un seul signe SHUNPO"),
    marks,
    caption: { before: "4 outils · chacun de son côté", after: "1 système · vos outils ensemble" },
  },
} satisfies Meta<typeof HeroShuriken>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Laid: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      canvas.getByRole("img", { name: "Quatre feuilles de papier posées à plat" }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("4 outils · chacun de son côté")).toBeInTheDocument();
  },
};

/* The stage alone at the end of its story: the sign folded on its pebble, seen from above. */
export const Folded: StoryObj<typeof AgentsShurikenStage> = {
  render: () => (
    <div style={{ width: 480 }}>
      <AgentsShurikenStage
        poster={plainPoster("Le signe SHUNPO plié sur son galet")}
        progress={{ value: 1 }}
        marks={marks}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Le signe SHUNPO plié sur son galet" }),
    ).toBeInTheDocument();
  },
};
