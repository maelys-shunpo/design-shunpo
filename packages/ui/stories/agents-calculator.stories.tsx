import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { expect } from "storybook/test";

import { AgentsAction } from "../src/agents/action.tsx";
import type { CalculatorModel } from "../src/agents/calculator-model.ts";
import { Calculator } from "../src/agents/calculator.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const model: CalculatorModel = {
  team: "team",
  tasks: [{ question: "retyping", rate: 0.4, title: "Saisie et ressaisie" }],
  questions: [
    {
      id: "team",
      prompt: "Combien de personnes dans votre équipe ?",
      kind: "single",
      options: [
        { value: "1-5", label: "1 à 5", amount: 3 },
        { value: "6-15", label: "6 à 15", amount: 10 },
        { value: "16-30", label: "16 à 30", amount: 22 },
      ],
    },
    {
      id: "retyping",
      prompt: "Saisie et ressaisie d’informations entre vos outils ?",
      kind: "single",
      options: [
        { value: "lt1", label: "Moins d’1 h", amount: 0.5 },
        { value: "1-3", label: "1 à 3 h", amount: 2 },
        { value: "3-5", label: "3 à 5 h", amount: 4 },
      ],
    },
    {
      id: "tools",
      prompt: "Vos outils aujourd’hui ?",
      kind: "multi",
      options: [
        { value: "erp", label: "Logiciel de gestion ou ERP" },
        { value: "excel", label: "Excel partagés" },
      ],
    },
  ],
};

function renderButton(props: ComponentProps<"button">) {
  return <button type="button" {...props} />;
}

const meta = {
  title: "Agents/Calculator",
  component: Calculator,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The lost-hours calculator that replaces the task composer: one question a screen with progress and a way back, then a result that shows the loss first, the recoverable hours, three figures, a dial for the hourly cost, the three biggest time sources, and the method laid open. All in the browser, no server.",
      },
    },
  },
  args: {
    model,
    hoursLeadIn: "Par personne et par semaine, combien de temps pour…",
    reportCta: (
      <AgentsAction render={renderButton} variant="signal" size="md">
        Recevoir le rapport détaillé
      </AgentsAction>
    ),
  },
} satisfies Meta<typeof Calculator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Depart: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Question 1 / 3")).toBeVisible();
    await expect(canvas.getByText("Combien de personnes dans votre équipe ?")).toBeVisible();
  },
};

export const Parcours: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "6 à 15" }));
    await userEvent.click(canvas.getByRole("button", { name: "Continuer" }));

    await expect(
      canvas.getByText("Par personne et par semaine, combien de temps pour…"),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "3 à 5 h" }));
    await userEvent.click(canvas.getByRole("button", { name: "Continuer" }));

    await expect(canvas.getByText("Plusieurs réponses possibles.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Excel partagés" }));
    await userEvent.click(canvas.getByRole("button", { name: "Voir le résultat" }));

    await expect(canvas.getByText(/perd environ/u)).toBeVisible();
    await expect(canvas.getByText("Coût horaire chargé : 33 €")).toBeVisible();
  },
};
