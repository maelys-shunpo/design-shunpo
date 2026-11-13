import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ApprovalCard } from "../src/agents/approval-card.tsx";
import { ChatBubble } from "../src/agents/chat-bubble.tsx";
import { MailRow } from "../src/agents/mail-row.tsx";
import { MockWindow } from "../src/agents/mock-window.tsx";
import { ToastNote } from "../src/agents/toast-note.tsx";
import { Stack } from "../src/layout/stack.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Coupe",
  component: MockWindow,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "The one corner language of « Agents » (`agents-sheet`): square corners, one cut at the top right in proportion to the object (bubble 10, toast 12, note 16, window 20), a Shiro hairline along it, hairlines instead of boxes inside, the fold for what is handed to you, the cut on the speaker's side for bubbles.",
      },
    },
  },
  args: { title: "Agent factures", context: "Comptabilité fournisseurs", children: null },
} satisfies Meta<typeof MockWindow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Coupe: Story = {
  render: (args) => (
    <Stack gap="lg">
      <MockWindow {...args}>
        <MailRow
          from="Métallerie Rhône-Alpes"
          subject="Facture F-2026-1184"
          time="09:42"
          selected
        />
        <MailRow from="Fournitures" subject="Commande livrée" time="08:30" />
      </MockWindow>
      <ApprovalCard
        reason="Au-delà de votre seuil"
        detail="Facture de 2 400 € à payer"
        approve="Approuver"
        edit="Modifier"
      />
      <ToastNote app="Slack · #compta" message="Trois factures saisies dans Odoo" time="09:44" />
      <Stack gap="sm">
        <ChatBubble from="customer" author="Vous">
          Où en est ma commande ?
        </ChatBubble>
        <ChatBubble from="agent" author="L’agent">
          Elle part demain matin.
        </ChatBubble>
      </Stack>
    </Stack>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Agent factures")).toBeVisible();
    await expect(canvas.getByText("Elle part demain matin.")).toBeVisible();
  },
};
