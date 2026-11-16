import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Entry } from "../src/instant/entry.tsx";
import { MethodStep } from "../src/instant/method-step.tsx";
import { Question } from "../src/instant/question.tsx";
import { Spread } from "../src/instant/spread.tsx";
import { StruckLine } from "../src/instant/struck-line.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { Heading } from "../src/typography/heading.tsx";
import { inInstant } from "./support/instant-direction.tsx";

const meta = {
  title: "Instant/Spread",
  component: Spread,
  decorators: [inInstant],
  parameters: {
    docs: {
      description: {
        component:
          "A double page: a narrow margin for the title (held while the text scrolls with hold) and a wide column. The lists of the direction sit in it: Entry (a numbered item), Question (a native disclosure), StruckLine (a correction in the margin) and MethodStep (a step under its kanji).",
      },
    },
  },
  args: {
    hold: true,
    margin: (
      <Heading level={2} size="title-lg">
        Le constat
      </Heading>
    ),
    children: (
      <Stack as="ol" gap="none">
        <Entry index="01" title="Des heures perdues à recopier">
          Copier des données, mettre à jour des tableaux, relancer.
        </Entry>
        <Entry index="02" title="Des outils qui ne se parlent pas">
          Chaque passage de l’un à l’autre crée un oubli ou une erreur.
        </Entry>
      </Stack>
    ),
  },
} satisfies Meta<typeof Spread>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Entries: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};

export const Questions: Story = {
  args: {
    children: (
      <div>
        <Question question="Nous avons déjà beaucoup de logiciels.">
          Souvent, la valeur vient de connecter ce qui existe.
        </Question>
      </div>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText("Nous avons déjà beaucoup de logiciels."));
    await expect(
      canvas.getByText("Souvent, la valeur vient de connecter ce qui existe."),
    ).toBeVisible();
  },
};

export const Corrections: Story = {
  args: {
    align: "stretch",
    children: (
      <Stack as="ul" gap="none">
        <StruckLine sold="Un agent IA" bought="Des tâches qui se font seules." />
      </Stack>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Un agent IA").tagName).toBe("DEL");
  },
};

export const Method: Story = {
  args: {
    hold: false,
    children: (
      <ol>
        <MethodStep kanji="観" kanjiLabel="Kan, observer" index="01" title="Comprendre et auditer">
          Nous regardons comment votre entreprise fonctionne vraiment.
        </MethodStep>
      </ol>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Comprendre et auditer" })).toBeVisible();
  },
};
