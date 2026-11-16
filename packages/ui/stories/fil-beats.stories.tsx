import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilBeats } from "../src/fil/fil-beats.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilBeats",
  component: FilBeats,
  decorators: [inFilDirection],
  args: {
    label: "Les trois temps du tressage",
    beats: [
      { name: "Emmêlé", line: "Chaque fil tire de son côté." },
      { name: "Peigné", line: "Les données circulent seules." },
      { name: "Tressé", line: "Un seul système, solide." },
    ],
  },
} satisfies Meta<typeof FilBeats>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstChapterLit: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list", { name: "Les trois temps du tressage" })).toBeVisible();
    await expect(canvas.getByText("Chaque fil tire de son côté.")).toBeVisible();
  },
};
