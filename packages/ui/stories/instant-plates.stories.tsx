import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ExpertisePlate } from "../src/instant/expertise-plate.tsx";
import { FrameItem } from "../src/instant/frame-item.tsx";
import { FrameList } from "../src/instant/frame-list.tsx";
import { ReferenceRow } from "../src/instant/reference-row.tsx";
import { inInstant } from "./support/instant-direction.tsx";

const plate = {
  title: "Intelligence artificielle et automatisation",
  outcome: "Les tâches répétitives se font seules.",
  detail: "Nous transformons des process manuels en systèmes automatisés et fiables.",
  scope: ["Agents IA", "Extraction de données"],
  example: "Les documents reçus par e-mail sont lus, rangés et validés.",
};

const meta = {
  title: "Instant/FrameList",
  component: FrameList,
  decorators: [inInstant],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A list whose frame designates one item at a time: pointing at or focusing an item makes its four corners jump there, trailed by two fading ghosts (from the large breakpoint). Holds ExpertisePlate items; ReferenceRow is the register line that turns to ink on hover.",
      },
    },
  },
  args: {
    children: ["01", "02"].map((index) => (
      <FrameItem key={index}>
        <ExpertisePlate index={index} {...plate} />
      </FrameItem>
    )),
  },
} satisfies Meta<typeof FrameList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expertises: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.hover(
      canvas.getAllByText("Les tâches répétitives se font seules.")[1] ?? canvasElement,
    );
    await expect(
      canvasElement.querySelectorAll("[data-slot=frame-list] > li[aria-hidden] > span"),
    ).toHaveLength(12);
  },
};

export const References: Story = {
  render: () => (
    <ul>
      <li>
        <ReferenceRow
          href="#tf1"
          name="TF1"
          project="Application de jeu"
          stake="Trafic massif en direct"
        />
      </li>
    </ul>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /TF1/u })).toHaveAttribute("href", "#tf1");
  },
};
