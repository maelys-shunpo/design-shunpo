import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { ChatBubble } from "../src/agents/chat-bubble.tsx";
import { EmailDraft } from "../src/agents/email-draft.tsx";
import { FieldRow } from "../src/agents/field-row.tsx";
import { RecordCard } from "../src/agents/record-card.tsx";
import { SourceChip } from "../src/agents/source-chip.tsx";
import { TypingDots } from "../src/agents/typing-dots.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Conversation",
  component: ChatBubble,
  decorators: [inAgents],
  parameters: {
    docs: {
      description: {
        component:
          "Conversations between a customer, the agent and the team (ChatBubble with SourceChip, TypingDots while the agent works), a CRM record it completes (RecordCard) and a draft it leaves for a person to send (EmailDraft).",
      },
    },
  },
  args: { author: "Agent support", children: "Bonjour." },
} satisfies Meta<typeof ChatBubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Thread: Story = {
  render: () => (
    <div>
      <ChatBubble from="customer" author="Inès R." time="14:02">
        Où en est ma commande ?
      </ChatBubble>
      <TypingDots label="L’agent consulte la commande" live={2} />
      <ChatBubble
        author="Agent support"
        typeStep={3}
        sources={<SourceChip index={1} label="Suivi" live={4} />}
      >
        Elle arrive vendredi.
      </ChatBubble>
      <ChatBubble from="human" author="Claire">
        Je prends le relais.
      </ChatBubble>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Elle arrive vendredi.")).toBeInTheDocument();
  },
};

export const Record: Story = {
  render: () => (
    <div>
      <RecordCard name="Atelier Brunel" initials="AB" subtitle="Menuiserie" live={1}>
        <FieldRow label="Contact" value="Hugo Brunel" />
      </RecordCard>
      <EmailDraft
        to="hugo@exemple.fr"
        subject="Un premier échange ?"
        body={"Bonjour Hugo,\nMerci."}
        sendLabel="Envoyer"
        typeStep={4}
      />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Un premier échange ?")).toBeInTheDocument();
  },
};
