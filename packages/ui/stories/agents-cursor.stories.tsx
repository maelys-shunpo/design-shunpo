import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentsAction } from "../src/agents/action.tsx";
import { Cursor } from "../src/agents/cursor.tsx";
import { TextField } from "../src/agents/text-field.tsx";
import { Container } from "../src/layout/container.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { Heading } from "../src/typography/heading.tsx";
import { Text } from "../src/typography/text.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Cursor",
  component: Cursor,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The page's own cursor (DA « Immobile, puis instantané »). Move the mouse across the panel to feel it. Two forms to compare: **Coupe** is the direction's hard cut square that holds to the pointer with no trail and a two-corner frame that jumps to designate; **Satin** is the Framer-smooth reading, a round dot and a ring that trail the pointer with a soft lag, the ring widening over a control, and a thin outline keeping the object's own coupe gliding onto a card. Both are ink, never red; both keep the system cursor on a field, on touch and under reduced motion.",
      },
    },
  },
  args: { form: "coupe", travel: "shift" },
} satisfies Meta<typeof Cursor>;

export default meta;

type Story = StoryObj<typeof meta>;

/* A panel of the surfaces the cursor answers, so the one cursor can be watched changing from element to element. */
function Playground() {
  return (
    <Container size="narrow">
      <Stack gap="xl" className="p-10">
        <Stack gap="sm">
          <Heading level={2}>Passez la souris sur les éléments</Heading>
          <Text>
            Le point suit la souris, s’efface devant une action, et désigne une carte. Comparez la
            coupe (dure, qui saute) et le satin (rond, qui glisse).
          </Text>
        </Stack>
        <div className="flex flex-wrap items-center gap-4">
          <AgentsAction href="#immersion">Réserver une Immersion</AgentsAction>
          <AgentsAction variant="outline" href="#methode">
            Voir la méthode
          </AgentsAction>
          <TextField label="Votre email" placeholder="vous@entreprise.fr" />
        </div>
        <div
          data-cursor="designate"
          className="agents-sheet flex aspect-3/2 w-full items-end agents-card-paper p-6 text-agents-ink"
        >
          <Text>Carte cas client — le curseur la désigne</Text>
        </div>
      </Stack>
    </Container>
  );
}

export const Coupe: Story = {
  render: () => (
    <>
      <Cursor form="coupe" travel="shift" />
      <Playground />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Carte cas client — le curseur la désigne")).toBeVisible();
  },
};

export const Satin: Story = {
  render: () => (
    <>
      <Cursor form="satin" />
      <Playground />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Voir la méthode" })).toBeVisible();
  },
};

export const Carre: Story = {
  render: () => (
    <>
      <Cursor form="carre" />
      <Playground />
    </>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Réserver une Immersion" })).toBeVisible();
  },
};
