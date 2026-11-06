import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siHubspot, siNotion, siShopify, siStripe } from "simple-icons";
import { expect } from "storybook/test";

import { Marquee } from "../src/agents/marquee.tsx";
import { ToolColumns } from "../src/agents/tool-columns.tsx";
import { ToolTile } from "../src/agents/tool-tile.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Marquee",
  component: Marquee,
  decorators: [inAgents],
  args: { children: null },
} satisfies Meta<typeof Marquee>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ToolWall: Story = {
  render: () => (
    <ToolColumns>
      <Marquee direction="up" lap={20} label="Colonne 1">
        <ToolTile icon={siGmail} />
        <ToolTile icon={siHubspot} />
      </Marquee>
      <Marquee direction="down" lap={20} label="Colonne 2">
        <ToolTile icon={siNotion} name="Notion" />
        <ToolTile icon={siShopify} />
      </Marquee>
      <Marquee direction="up" label="Colonne 3">
        <ToolTile icon={siStripe} />
      </Marquee>
    </ToolColumns>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Colonne 1")).toBeInTheDocument();
  },
};

export const Row: Story = {
  render: () => (
    <Marquee label="Références" direction="right" lap={10}>
      <span>TF1</span>
      <span>Altaroc</span>
      <span>lemlist</span>
    </Marquee>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Références")).toBeInTheDocument();
  },
};
