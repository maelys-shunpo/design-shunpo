import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { NightPlate } from "../src/agents/night-plate.tsx";
import { QuestionScene } from "../src/agents/question-scene.tsx";
import { StatementLines } from "../src/agents/statement-lines.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/QuestionScene",
  component: QuestionScene,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "QuestionScene, as on the home page: held on screen, Fuji Night arrives as a card around the question, the four NightPlates arrive around it, the SHUNPO shuriken cuts the night away and the StatementLines answer rises on the paper. Reduced motion: the question and its plates on a night band, then the answer under the shuriken.",
      },
    },
  },
  args: {
    question: <h2 className="text-center font-display text-5xl">Vos outils ne suivent plus ?</h2>,
    plates: [
      {
        title: "Vous ressaisissez les mêmes données",
        text: "Un devis, une facture, un Excel.",
      },
      {
        title: "Vous cherchez la bonne information",
        text: "Mails, WhatsApp, Drive.",
      },
      {
        title: "Tout repose sur une personne",
        text: "Quand elle est absente, tout ralentit.",
      },
      { title: "Vous pilotez à l’aveugle", text: "Le problème a déjà coûté." },
    ],
    answer: [
      ["Vos outils devraient", "vous faire gagner du temps."],
      ["Pas vous en faire perdre."],
    ],
    answerLevel: "h3",
  },
} satisfies Meta<typeof QuestionScene>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scene: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  },
};

export const Parts: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-8">
      <div className="bg-background p-8 scheme-dark">
        <NightPlate title="Vous ressaisissez les mêmes données" text="Un devis, une facture." />
      </div>
      <StatementLines
        paragraphs={[
          ["Vos outils devraient", "vous faire gagner du temps."],
          ["Pas vous en faire perdre."],
        ]}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Pas vous en faire perdre.")).toBeVisible();
  },
};
