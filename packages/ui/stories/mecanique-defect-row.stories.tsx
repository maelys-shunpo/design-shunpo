import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { DefectRow } from "../src/mecanique/defect-row.tsx";

const meta = {
  title: "Mécanique/DefectRow",
  component: DefectRow,
  decorators: [
    (Story) => (
      <Direction name="mecanique">
        <ol>
          <Story />
        </ol>
      </Direction>
    ),
  ],
  args: {
    index: "Défaut 01",
    title: "Des heures perdues à recopier",
    detail: "Copier des données, mettre à jour des tableaux, relancer, chercher une information.",
  },
} satisfies Meta<typeof DefectRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Défaut 01")).toBeVisible();
  },
};

export const Still: Story = { args: { emphasis: "none" } };
