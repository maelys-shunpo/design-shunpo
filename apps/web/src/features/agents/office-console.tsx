import { ApprovalCard } from "@repo/ui/agents/approval-card";
import { DocumentSheet } from "@repo/ui/agents/document-sheet";
import { FieldRow } from "@repo/ui/agents/field-row";
import { MailRow } from "@repo/ui/agents/mail-row";
import { MockPane } from "@repo/ui/agents/mock-pane";
import { MockWindow } from "@repo/ui/agents/mock-window";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { ToolCall } from "@repo/ui/agents/tool-call";
import { siOdoo } from "simple-icons";

import { extracted, inbox, invoice } from "./office-data";

/* The back-office agent at work: the inbox it reads, the invoice it boxes, the fields it fills and the human it asks. */
export function OfficeConsole() {
  return (
    <MockWindow
      title="Agent factures"
      context="Comptabilité fournisseurs"
      layout="triple"
      status={<StatusPill tone="working">En service</StatusPill>}
    >
      <MockPane title="Boîte de réception" meta="5 nouveaux" from="md">
        {inbox.map((mail, index) => (
          <MailRow
            key={mail.subject}
            from={mail.from}
            subject={mail.subject}
            time={mail.time}
            attachment={mail.attachment}
            selected={index === 0}
            live={index === 0 ? 1 : undefined}
            status={<StatusPill tone={mail.tone}>{mail.status}</StatusPill>}
          />
        ))}
      </MockPane>
      <MockPane title="Document" meta="F-2026-1184.pdf" from="lg" tone="white">
        <DocumentSheet {...invoice} scanStep={2} />
      </MockPane>
      <MockPane title="Extraction" meta="lue en 11 s" tone="white">
        <dl>
          {extracted.map((field) => (
            <FieldRow key={field.label} {...field} live={3} />
          ))}
        </dl>
        <ToolCall
          icon={siOdoo}
          tool="Odoo"
          action="Créer la facture fournisseur"
          live={4}
          progressStep={5}
          result="Brouillon FACT/2026/0918 créé"
        />
        <ApprovalCard
          reason="Validation requise"
          detail="Le montant dépasse le seuil de 2 000 € fixé par l’équipe. Validation par Claire."
          approve="Approuver"
          edit="Modifier"
          live={6}
          outcome={
            <StatusPill tone="done" live={7}>
              Approuvée par Claire M. · 09:44
            </StatusPill>
          }
        />
      </MockPane>
    </MockWindow>
  );
}
