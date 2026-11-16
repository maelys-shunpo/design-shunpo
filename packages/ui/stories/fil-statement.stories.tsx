import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilSection } from "../src/fil/fil-section.tsx";
import { FilStatement } from "../src/fil/fil-statement.tsx";
import { Direction } from "../src/layout/direction.tsx";

const meta = {
  title: "Fil/FilStatement",
  component: FilStatement,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="fil">
        <FilSection ground="tenku">
          <ul className="px-8">
            <Story />
          </ul>
        </FilSection>
      </Direction>
    ),
  ],
  args: { notThis: "Un agent IA", butThis: "Des tâches qui se font seules, chaque jour." },
} satisfies Meta<typeof FilStatement>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnTheField: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Un agent IA").tagName).toBe("S");
  },
};
