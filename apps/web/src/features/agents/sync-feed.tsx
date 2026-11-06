import { LiveSurface } from "@repo/ui/agents/live-surface";
import { MockWindow } from "@repo/ui/agents/mock-window";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { SyncEvent } from "@repo/ui/agents/sync-event";
import { siGmail, siGooglesheets, siHubspot, siNotion, siOdoo, siShopify } from "simple-icons";

const events = [
  {
    icon: siGmail,
    tool: "Gmail",
    event: "A lu 3 factures fournisseurs",
    time: "09:41",
    tone: "done",
    status: "Lu",
  },
  {
    icon: siOdoo,
    tool: "Odoo",
    event: "A préparé 2 brouillons de facture",
    time: "09:42",
    tone: "done",
    status: "Écrit",
  },
  {
    icon: siHubspot,
    tool: "HubSpot",
    event: "A complété la fiche Atelier Brunel",
    time: "09:43",
    tone: "done",
    status: "À jour",
  },
  {
    icon: siShopify,
    tool: "Shopify",
    event: "A demandé la relivraison de la commande 10482",
    time: "09:44",
    tone: "working",
    status: "En cours",
  },
  {
    icon: siGooglesheets,
    tool: "Google Sheets",
    event: "A mis à jour le planning des chantiers",
    time: "09:45",
    tone: "done",
    status: "À jour",
  },
  {
    icon: siNotion,
    tool: "Notion",
    event: "A rédigé un compte rendu, en attente de Claire",
    time: "09:46",
    tone: "waiting",
    status: "À valider",
  },
] as const;

/* The agents' activity across the tools, one line after the other. */
export function SyncFeed() {
  return (
    <LiveSurface hold={5}>
      <MockWindow
        title="Ce que les agents ont fait ce matin"
        context="Aujourd’hui"
        status={<StatusPill tone="done">6 outils reliés</StatusPill>}
      >
        <ul aria-label="Activité des agents">
          {events.map((item, index) => (
            <SyncEvent
              key={item.event}
              icon={item.icon}
              tool={item.tool}
              event={item.event}
              time={item.time}
              live={index + 1}
              status={<StatusPill tone={item.tone}>{item.status}</StatusPill>}
            />
          ))}
        </ul>
      </MockWindow>
    </LiveSurface>
  );
}
