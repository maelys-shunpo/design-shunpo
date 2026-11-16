import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Direction } from "../src/layout/direction.tsx";
import { Grid } from "../src/layout/grid.tsx";
import { MethodStep } from "../src/origami/method-step.tsx";

const meta = {
  title: "Origami/MethodStep",
  component: MethodStep,
  decorators: [
    (Story) => (
      <Direction name="origami">
        <div className="p-8">
          <Story />
        </div>
      </Direction>
    ),
  ],
  args: {
    numeral: "I",
    title: "Comprendre et auditer",
    children: "Nous regardons comment votre entreprise fonctionne vraiment.",
  },
  render: (args) => (
    <Grid as="ol" columns="3">
      <MethodStep {...args} />
      <MethodStep numeral="II" title="Concevoir et intégrer">
        La solution est testée avant la mise en production.
      </MethodStep>
      <MethodStep numeral="III" title="Accompagner et former">
        Vos équipes restent maîtres de leurs outils.
      </MethodStep>
    </Grid>
  ),
} satisfies Meta<typeof MethodStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Steps: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};
