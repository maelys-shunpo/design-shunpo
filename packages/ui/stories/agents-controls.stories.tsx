import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { AgentsAction } from "../src/agents/action.tsx";
import { Chip } from "../src/agents/chip.tsx";
import { Eyebrow } from "../src/agents/eyebrow.tsx";
import { TextField } from "../src/agents/text-field.tsx";
import { Inline } from "../src/layout/inline.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Controls",
  component: AgentsAction,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The page's controls on one corner scale: buttons and fields on the control radius (8 px), chips as pills. Solid for the one action that matters, outline beside it, quiet as text; an arrow for actions that take the visitor somewhere.",
      },
    },
  },
  args: { href: "#diagnostic", children: "Réserver un diagnostic" },
} satisfies Meta<typeof AgentsAction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: (args) => (
    <Stack gap="md">
      <Inline gap="sm">
        <AgentsAction {...args} size="lg" arrow />
        <AgentsAction href="#agents" size="lg" variant="outline">
          Voir un agent au travail
        </AgentsAction>
        <AgentsAction href="#cas" size="lg" variant="quiet">
          Lire le cas client
        </AgentsAction>
      </Inline>
      <Inline gap="sm">
        <AgentsAction {...args} />
        <AgentsAction href="#" aria-disabled>
          Indisponible
        </AgentsAction>
      </Inline>
    </Stack>
  ),
  play: async ({ canvas }) => {
    const [primary] = canvas.getAllByRole("link", { name: "Réserver un diagnostic" });
    await expect(primary).toHaveAttribute("href", "#diagnostic");
  },
};

export const FieldAndChips: Story = {
  render: () => (
    <Stack gap="md">
      <Eyebrow align="center">Essayer</Eyebrow>
      <TextField label="Tâche à confier" placeholder="Ex. : recopier les bons de commande" />
      <Inline gap="xs">
        <Chip type="button">Saisir les factures</Chip>
        <Chip type="button" aria-pressed>
          Relancer les devis
        </Chip>
        <Chip render={<span />} size="sm" tone="quiet">
          Suivi transporteur
        </Chip>
      </Inline>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Tâche à confier" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Relancer les devis" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
