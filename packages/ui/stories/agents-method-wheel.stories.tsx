import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Headline } from "../src/agents/headline.tsx";
import { MethodWheel } from "../src/agents/method-wheel.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/MethodWheel",
  component: MethodWheel,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The method as the home page's wheel. Held under the floating nav from tablets up for three screens: the question stands alone, then rises and fades while a sumi stroke comes down a wide arc; when its drop lands the first phase is named, then the same stroke runs on down the page and the page follows its tip: the ink, its drops and the phases rise with the scroll, each drop landing as the stroke reaches it, each copy sliding up like a page and crossing the next in a fade. The current phase's deliverables tick one by one, those of a phase still to come stay unticked, its still shows with its kanji behind it; with a film, the paper folds from one phase's still into the next as the ink moves on. Phones and reduced motion: the question, then every phase complete with its still.",
      },
    },
  },
  args: {
    title: (
      <Headline level={2} align="center">
        Chaque projet commence par une Immersion
      </Headline>
    ),
    phases: [
      {
        id: "immersion",
        label: "5 jours auprès de vos équipes",
        title: "Immersion",
        text: "On suit votre équipe pour comprendre où le travail ralentit.",
        deliverables: [
          "Carte des processus",
          "Heures perdues estimées",
          "Feuille de route priorisée",
        ],
        kanji: "見",
        panel: <p>Carte du flux</p>,
      },
      {
        id: "construction",
        label: "Brique par brique",
        title: "Construction",
        text: "On construit un premier flux et on le teste avec votre équipe.",
        deliverables: ["Interface de suivi", "Outils connectés", "Agents configurés"],
        kanji: "築",
        panel: <p>Flux factures</p>,
      },
      {
        id: "evolution",
        label: "Après la mise en service",
        title: "Évolution",
        text: "On regarde avec votre équipe ce qui se passe au quotidien.",
        deliverables: ["Suivi des usages", "Maintenance des connexions", "Nouveaux flux"],
        kanji: "進",
        panel: <p>Flux en production</p>,
      },
    ],
  },
} satisfies Meta<typeof MethodWheel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Wheel: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  },
};
