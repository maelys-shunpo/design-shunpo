import type { Meta, StoryObj } from "@storybook/react-vite";
import { siGmail, siOdoo } from "simple-icons";
import { expect } from "storybook/test";

import { ApprovalCard } from "../src/agents/approval-card.tsx";
import { Avatar } from "../src/agents/avatar.tsx";
import { StatusPill } from "../src/agents/status-pill.tsx";
import { ToolCall } from "../src/agents/tool-call.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Actions",
  component: ToolCall,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "What an agent does in other tools (ToolCall, with a progress bar that fills), the moment it hands a decision to a person (ApprovalCard), statuses (StatusPill) and who is who (Avatar).",
      },
    },
  },
  args: { tool: "Odoo", action: "Créer la facture" },
} satisfies Meta<typeof ToolCall>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Actions: Story = {
  render: () => (
    <div>
      <ToolCall
        icon={siOdoo}
        tool="Odoo"
        action="Créer la facture"
        live={4}
        progressStep={5}
        result="Brouillon créé"
      />
      <ToolCall tool="ERP maison" action="Archiver" />
      <ToolCall icon={siGmail} tool="Gmail" action="Envoyer" />
      <ApprovalCard
        reason="Validation requise"
        detail="Montant au-delà du seuil."
        approve="Approuver"
        edit="Modifier"
        outcome={<StatusPill tone="done">Approuvée</StatusPill>}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Brouillon créé")).toBeInTheDocument();
  },
};

export const Statuses: Story = {
  render: () => (
    <div>
      <StatusPill tone="done">Traitée</StatusPill>
      <StatusPill tone="waiting">À valider</StatusPill>
      <StatusPill tone="working">En cours</StatusPill>
      <StatusPill tone="new">Nouveau</StatusPill>
      <StatusPill>Neutre</StatusPill>
      <Avatar initials="CM" tone="warm" size="sm" />
      <Avatar initials="SM" tone="mint" />
      <Avatar initials="AB" tone="cobalt" />
      <Avatar initials="IR" />
      <Avatar initials="■" tone="agent" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Nouveau")).toBeInTheDocument();
  },
};
