import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { DocumentSheet } from "../src/agents/document-sheet.tsx";
import { FieldRow } from "../src/agents/field-row.tsx";
import { MailRow } from "../src/agents/mail-row.tsx";
import { MockPane } from "../src/agents/mock-pane.tsx";
import { MockWindow } from "../src/agents/mock-window.tsx";
import { StatusPill } from "../src/agents/status-pill.tsx";
import { inAgents } from "./support/agents-direction.tsx";

const meta = {
  title: "Agents/Mockups",
  component: MockWindow,
  decorators: [inAgents],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The window of an application SHUNPO builds (MockWindow, MockPane), an inbox (MailRow), a document the agent boxes (DocumentSheet) and the fields it extracts (FieldRow). Every piece takes `live` and `liveKind` to replay inside a LiveSurface.",
      },
    },
  },
  args: { title: "Agent factures", context: "Comptabilité fournisseurs", children: null },
} satisfies Meta<typeof MockWindow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Office: Story = {
  render: (args) => (
    <MockWindow
      {...args}
      layout="triple"
      status={<StatusPill tone="working">En service</StatusPill>}
    >
      <MockPane title="Boîte de réception" meta="2 nouveaux">
        <MailRow
          from="Métallerie Rhône-Alpes"
          subject="Facture F-2026-1184"
          time="09:42"
          attachment="F-1184.pdf"
          selected
          live={1}
          status={<StatusPill tone="done">Traitée</StatusPill>}
        />
        <MailRow
          from="Imprimerie Lumière"
          subject="Relance"
          time="09:21"
          status={<StatusPill tone="waiting">À valider</StatusPill>}
        />
        <MailRow from="Fournitures" subject="Commande livrée" time="08:30" />
      </MockPane>
      <MockPane title="Document" tone="white" from="md">
        <DocumentSheet
          issuer="Métallerie Rhône-Alpes"
          address="Lyon"
          kind="Facture"
          reference="F-1184"
          date="04/11/2026"
          lines={[{ label: "Garde-corps", amount: "2 790,00 €" }]}
          total="3 348,00 €"
          scanStep={2}
        />
      </MockPane>
      <MockPane title="Extraction" tone="white" from="lg">
        <dl>
          <FieldRow label="Fournisseur" value="Métallerie Rhône-Alpes" confidence="99 %" live={3} />
          <FieldRow label="Compte" value="Chantier" flagged />
        </dl>
      </MockPane>
    </MockWindow>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region", { name: "Boîte de réception" })).toBeInTheDocument();
    await expect(canvas.getByText("Chantier")).toBeInTheDocument();
  },
};

export const Single: Story = {
  args: { children: <MockPane title="Vide">{null}</MockPane> },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Agent factures")).toBeInTheDocument();
  },
};
