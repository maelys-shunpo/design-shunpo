import { EmailDraft } from "@repo/ui/agents/email-draft";
import { FieldRow } from "@repo/ui/agents/field-row";
import { MockPane } from "@repo/ui/agents/mock-pane";
import { MockWindow } from "@repo/ui/agents/mock-window";
import { RecordCard } from "@repo/ui/agents/record-card";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { ToolCall } from "@repo/ui/agents/tool-call";
import { siCalendly, siHubspot } from "simple-icons";

const enriched = [
  { label: "Contact", value: "Hugo Brunel, gérant" },
  { label: "Source", value: "Formulaire du site" },
  { label: "Besoin", value: "Portail client et devis" },
  { label: "Taille", value: "PME, 20 à 50 salariés" },
  { label: "Priorité", value: "Haute", flagged: true },
];

const body =
  "Bonjour Hugo,\n\nMerci pour votre demande. Vous parlez de devis encore envoyés depuis Excel : c’est exactement le type de process que nous simplifions. Trente minutes jeudi ou vendredi pour en parler ?\n\nBonne journée,\nLéa";

/* A sales agent: a lead arrives, it completes the CRM record, opens the deal and drafts the reply for a person. */
export function SalesConsole() {
  return (
    <MockWindow
      title="Agent commercial"
      context="Prospection · HubSpot"
      layout="split"
      status={<StatusPill tone="new">Nouveau lead</StatusPill>}
    >
      <MockPane title="Fiche enrichie" meta="il y a 2 min" tone="white">
        <RecordCard
          name="Atelier Brunel & Fils"
          initials="AB"
          subtitle="Menuiserie · Annecy"
          live={1}
        >
          {enriched.map((field) => (
            <FieldRow key={field.label} {...field} live={2} />
          ))}
        </RecordCard>
        <ToolCall
          icon={siHubspot}
          tool="HubSpot"
          action="Créer l’affaire"
          live={3}
          progressStep={3}
          result="Affaire « Portail client » · Découverte"
        />
      </MockPane>
      <MockPane title="Brouillon de relance" meta="à valider par Léa" from="md">
        <EmailDraft
          to="hugo@atelier-brunel.fr"
          subject="Votre portail client : un premier échange ?"
          body={body}
          sendLabel="Envoyer"
          live={4}
          typeStep={5}
        />
        <ToolCall
          icon={siCalendly}
          tool="Calendly"
          action="Proposer deux créneaux"
          live={6}
          progressStep={6}
          result="Jeudi 10 h · vendredi 14 h"
        />
      </MockPane>
    </MockWindow>
  );
}
