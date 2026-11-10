import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Headline } from "../src/agents/headline.tsx";
import { InkWord } from "../src/agents/ink-word.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/InkWord",
  component: InkWord,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The word a headline is about, in ink between square brackets « [ » « ] » in Fushimi (3 px, legs a quarter of an em). Painted complete; when its headline has not been seen yet, its lines rise as it comes a third of the way into the window, then the ink writes the word from its first letter to its last and the brackets are traced as it reaches the end (about 2 s). Reduced motion keeps it painted.",
      },
    },
  },
  args: { children: "Immersion" },
  render: (args) => (
    <Headline level={2} align="center">
      Notre méthode&#8239;: chaque projet commence par une <InkWord {...args} />
    </Headline>
  ),
} satisfies Meta<typeof InkWord>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InAHeadline: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("heading", { level: 2 })).toHaveAccessibleName(
      "Notre méthode : chaque projet commence par une Immersion",
    );
    await expect(canvasElement.querySelectorAll("[data-slot=ink-word] [data-ink-bracket]")).toHaveLength(2);
  },
};
