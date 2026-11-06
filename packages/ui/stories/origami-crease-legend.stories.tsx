import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { CreaseLegend } from "../src/origami/crease-legend.tsx";

const meta = {
  title: "Origami/CreaseLegend",
  component: CreaseLegend,
  decorators: [
    (Story) => (
      <Direction name="origami">
        <div className="p-8">
          <Story />
        </div>
      </Direction>
    ),
  ],
  args: { label: "Légende du patron", valley: "Pli vallée", mountain: "Pli montagne" },
} satisfies Meta<typeof CreaseLegend>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Legend: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list", { name: "Légende du patron" })).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};
