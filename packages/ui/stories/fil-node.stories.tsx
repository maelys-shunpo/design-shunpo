import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilNode } from "../src/fil/fil-node.tsx";
import { Grid } from "../src/layout/grid.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilNode",
  component: FilNode,
  decorators: [inFilDirection],
  args: {
    index: "01",
    title: "Des heures perdues à recopier",
    detail: "Copier des données, mettre à jour des tableaux, relancer, chercher une information.",
  },
  render: (args) => (
    <Grid as="ol" columns="2">
      <FilNode {...args} />
      <FilNode {...args} index="02" title="Des outils qui ne se parlent pas" />
    </Grid>
  ),
} satisfies Meta<typeof FilNode>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};
