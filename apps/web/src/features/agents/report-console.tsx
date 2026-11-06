import { FieldRow } from "@repo/ui/agents/field-row";
import { MockPane } from "@repo/ui/agents/mock-pane";
import { MockWindow } from "@repo/ui/agents/mock-window";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { ToolCall } from "@repo/ui/agents/tool-call";
import { Text } from "@repo/ui/typography/text";
import { siAirtable, siGooglesheets, siQuickbooks } from "simple-icons";

const week = [
  { label: "Chantiers en cours", value: "14" },
  { label: "Chantiers en retard", value: "3", flagged: true },
  { label: "Factures à relancer", value: "2" },
  { label: "Devis envoyés", value: "9" },
];

/* A reporting agent: every Monday it reads the scattered files and writes the summary management reads at 7:30. */
export function ReportConsole() {
  return (
    <MockWindow
      title="Agent pilotage"
      context="Direction · rapport du lundi"
      layout="split"
      status={<StatusPill tone="working">Lundi 07:28</StatusPill>}
    >
      <MockPane title="Sources lues" meta="4 fichiers" from="md">
        <ToolCall
          icon={siGooglesheets}
          tool="Google Sheets"
          action="Lire les plannings"
          live={1}
          progressStep={1}
          result="3 fichiers, 412 lignes"
        />
        <ToolCall
          icon={siAirtable}
          tool="Airtable"
          action="Lire les chantiers"
          live={2}
          progressStep={2}
          result="14 chantiers actifs"
        />
        <ToolCall
          icon={siQuickbooks}
          tool="QuickBooks"
          action="Lire les encours clients"
          live={3}
          progressStep={3}
          result="2 retards de paiement"
        />
      </MockPane>
      <MockPane title="Synthèse · semaine 45" meta="brouillon" tone="white">
        <dl data-live="4">
          {week.map((field) => (
            <FieldRow key={field.label} {...field} />
          ))}
        </dl>
        <Text size="sm" data-live="5" data-live-kind="type">
          Trois chantiers glissent, dont Villeurbanne : livraison d’acier décalée au 14. Deux
          factures clients sont à relancer avant vendredi. Aucun devis en attente depuis plus de
          sept jours.
        </Text>
        <StatusPill tone="done" live={6}>
          Envoyé à la direction · 07:30
        </StatusPill>
      </MockPane>
    </MockWindow>
  );
}
