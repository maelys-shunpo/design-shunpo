import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FilReference } from "../src/fil/fil-reference.tsx";
import { FilTagLine } from "../src/fil/fil-tag-line.tsx";
import { inFilDirection } from "./support/fil-direction.tsx";

const meta = {
  title: "Fil/FilReference",
  component: FilReference,
  decorators: [inFilDirection],
  args: {
    name: "TF1",
    project: "Application de jeu d’une émission en prime time",
    stake: "Trafic massif et montée en charge en direct",
    href: "#tf1",
  },
  render: (args) => (
    <FilTagLine>
      <FilReference {...args} tilt="left" />
      <FilReference {...args} name="Altaroc" href="#altaroc" tilt="right" />
      <FilReference {...args} name="lemlist" href="#lemlist" />
    </FilTagLine>
  ),
} satisfies Meta<typeof FilReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnTheString: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /Altaroc/u })).toHaveAttribute(
      "href",
      "#altaroc",
    );
  },
};
