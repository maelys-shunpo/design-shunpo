import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ClosingCoupe } from "../src/agents/closing-coupe.tsx";
import { FaqList } from "../src/agents/faq-list.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const items = [
  {
    id: "adapte",
    question: "Je ne sais pas si l’IA est adaptée à mon entreprise.",
    answer: "L’Immersion sert à repérer les cas d’usage utiles chez vous, et à écarter les autres.",
  },
  {
    id: "logiciels",
    question: "Nous avons déjà beaucoup de logiciels.",
    answer:
      "Souvent, la valeur vient de connecter et d’améliorer ce qui existe, sans tout remplacer.",
  },
  {
    id: "dependance",
    question: "Je ne veux pas dépendre d’un prestataire.",
    answer: "Documentation, transmission, formation : vos équipes comprennent et font évoluer.",
  },
];

/* Far more questions than the window holds, to show the pinned scene clips the overflow instead of scrolling. */
const manyItems = Array.from({ length: 24 }, (_, index) => ({
  id: `question-${String(index)}`,
  question: `Une question parmi beaucoup, numéro ${String(index + 1)} ?`,
  answer: "Une réponse assez longue pour que la liste dépasse la hauteur de la fenêtre.",
}));

const closing = (
  <div className="flex flex-col items-center gap-8">
    <h2 className="text-center font-display text-6xl text-balance text-foreground">
      Le dernier logiciel dont vous aurez besoin
    </h2>
    <a href="#parler" className="font-display text-lg text-foreground underline">
      Parlons de votre projet
    </a>
  </div>
);

const meta = {
  title: "Agents/Closing coupe",
  component: ClosingCoupe,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The closing call reached by a cut played on the real FAQ. The questions are read whole and interactive; after a reading dwell the shuriken crosses the page, the page gives and its two halves fall away to uncover the closing. From tablets up and with motion the scene is pinned; phones and reduced motion read the FAQ then the closing directly, whole.",
      },
    },
  },
  args: {
    faq: <FaqList title="Questions fréquentes" items={items} />,
    children: closing,
  },
} satisfies Meta<typeof ClosingCoupe>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closing: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Le dernier logiciel dont vous aurez besoin" }),
    ).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Parlons de votre projet" })).toBeVisible();
  },
};

export const TallFaq: Story = {
  args: { faq: <FaqList title="Questions fréquentes" items={manyItems} /> },
};
