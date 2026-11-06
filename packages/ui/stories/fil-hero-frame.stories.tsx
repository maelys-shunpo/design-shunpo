import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilHeroFrame } from "../src/fil/fil-hero-frame.tsx";
import { FilTitle } from "../src/fil/fil-title.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { Text } from "../src/typography/text.tsx";

const meta = {
  title: "Fil/FilHeroFrame",
  component: FilHeroFrame,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Direction name="fil">
        <div className="h-svh">
          <Story />
        </div>
      </Direction>
    ),
  ],
  args: {
    children: (
      <FilTitle level={1} size="hero">
        Démêlez votre quotidien.
      </FilTitle>
    ),
    foot: <Text tone="muted">Les chapitres de la scène</Text>,
  },
} satisfies Meta<typeof FilHeroFrame>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
  },
};
