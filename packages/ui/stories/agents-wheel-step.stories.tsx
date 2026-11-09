import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { WheelStep } from "../src/agents/wheel-step.tsx";
import { inAgents, PLATE } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/WheelStep",
  component: WheelStep,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "One phase of the method wheel, internal to `MethodWheel`: its label, title and text, its deliverables (ticked here, as phones and reduced motion read them; held, the wheel ticks them one by one), its board on the photograph and, from tablets up, its kanji pale behind the board.",
      },
    },
  },
  args: {
    backdrop: <img src={PLATE} alt="" />,
    phase: {
      id: "immersion",
      label: "5 jours auprès de vos équipes",
      title: "Immersion",
      text: "On suit votre équipe pour comprendre où le travail ralentit et choisir avec vous le premier flux à automatiser.",
      deliverables: [
        "Carte des processus",
        "Heures perdues estimées",
        "Feuille de route priorisée",
      ],
      kanji: "見",
      panel: <p>Carte du flux</p>,
    },
  },
  render: (args) => (
    <ol>
      <WheelStep {...args} />
    </ol>
  ),
} satisfies Meta<typeof WheelStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 3, name: "Immersion" })).toBeVisible();
    await expect(canvas.getByText("Feuille de route priorisée")).toBeVisible();
  },
};
