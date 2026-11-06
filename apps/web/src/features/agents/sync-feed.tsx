import { LiveSurface } from "@repo/ui/agents/live-surface";
import { MockWindow } from "@repo/ui/agents/mock-window";
import { StatusPill } from "@repo/ui/agents/status-pill";
import { SyncEvent } from "@repo/ui/agents/sync-event";
import { siGmail, siGooglesheets, siHubspot, siNotion, siOdoo, siShopify } from "simple-icons";

const events = [
  {
    icon: siGmail,
    tool: "Gmail",
    event: "3 factures reçues, 3 lues",
    time: "09:41",
    tone: "done",
    status: "Lu",
  },
  {
    icon: siOdoo,
    tool: "Odoo",
    event: "2 factures fournisseurs créées",
    time: "09:42",
    tone: "done",
    status: "Écrit",
  },
  {
    icon: siHubspot,
    tool: "HubSpot",
    event: "Fiche Atelier Brunel enrichie",
    time: "09:43",
    tone: "done",
    status: "À jour",
  },
  {
    icon: siShopify,
    tool: "Shopify",
    event: "Commande 10482 : relivraison demandée",
    time: "09:44",
    tone: "working",
    status: "En cours",
  },
  {
    icon: siGooglesheets,
    tool: "Google Sheets",
    event: "Planning chantiers synchronisé",
    time: "09:45",
    tone: "done",
    status: "À jour",
  },
  {
    icon: siNotion,
    tool: "Notion",
    event: "Compte rendu client à valider",
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
        title="Activité des agents"
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
