import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilExpertise } from "../src/fil/fil-expertise.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilExpertise",
  component: FilExpertise,
  decorators: [inFilDirection],
  args: {
    index: "01",
    title: "Intelligence artificielle et automatisation",
    outcome: "Les tâches répétitives se font seules.",
    detail: "Des process manuels et fragmentés deviennent des systèmes automatisés et fiables.",
    scope: ["Audit des process", "Agents IA", "Extraction de données"],
    example: "Le système récupère les documents, extrait les données et demande une validation.",
  },
} satisfies Meta<typeof FilExpertise>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Paper: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list", { name: "Interventions" })).toBeVisible();
  },
};
export const Tenku: Story = { args: { ground: "tenku", index: "02" } };
export const Ink: Story = { args: { ground: "ink", index: "03" } };
