import type { ConvergeTool } from "@repo/ui/agents/hero-convergence";
import { siGmail, siGooglesheets, siHubspot, siNotion, siOdoo, siShopify } from "simple-icons";

/* The tools a team juggles on a Monday morning, as each shows its record today, then the row the agent's work leaves
   in the workspace. Names, amounts and times are illustrative; logos from simple-icons (CC0). */
export const convergenceTools: ConvergeTool[] = [
  {
    id: "gmail",
    icon: siGmail,
    app: "Gmail",
    context: "Boîte de réception",
    title: "Métallerie Rhône-Alpes",
    detail: "Facture F-2026-1184",
    fields: [
      { label: "PDF", value: "F-1184.pdf" },
      { label: "Reçu", value: "09:42" },
    ],
    task: "Facture F-2026-1184 lue, brouillon créé dans Odoo",
    meta: "Gmail → Odoo · 09:42",
    status: { tone: "done", label: "Fait" },
  },
  {
    id: "hubspot",
    icon: siHubspot,
    app: "HubSpot",
    context: "Transactions",
    title: "Atelier Brunel",
    detail: "Devis sans réponse",
    fields: [
      { label: "Étape", value: "Devis envoyé" },
      { label: "Relancé", value: "Jamais" },
    ],
    task: "Relance du devis Atelier Brunel envoyée",
    meta: "HubSpot · 09:42",
    status: { tone: "done", label: "Fait" },
  },
  {
    id: "odoo",
    icon: siOdoo,
    app: "Odoo",
    context: "Fournisseurs",
    title: "FACT/2026/0918",
    detail: "Brouillon, à comptabiliser",
    fields: [
      { label: "Total TTC", value: "4 812,60 €" },
      { label: "Échéance", value: "04/12/2026" },
    ],
    task: "Facture de 4 812,60 € au-dessus du seuil",
    meta: "Odoo · 09:43 · pour Claire M.",
    status: { tone: "waiting", label: "À valider", owner: "CM" },
  },
  {
    id: "sheets",
    icon: siGooglesheets,
    app: "Google Sheets",
    context: "Chantiers",
    title: "Semaine 46",
    detail: "Trois dates à revoir",
    fields: [
      { label: "Villeurbanne", value: "Lun → Mer" },
      { label: "Vénissieux", value: "Jeu" },
    ],
    task: "Planning des chantiers mis à jour",
    meta: "Google Sheets · 09:47",
    status: { tone: "done", label: "Fait" },
  },
  {
    id: "shopify",
    icon: siShopify,
    app: "Shopify",
    context: "Commandes",
    title: "Commande #10482",
    detail: "Colis endommagé",
    fields: [
      { label: "Client", value: "J. Martin" },
      { label: "Transporteur", value: "Colissimo" },
    ],
    task: "Relivraison de la commande #10482 demandée",
    meta: "Shopify · 09:50",
    status: { tone: "done", label: "Fait" },
  },
  {
    id: "notion",
    icon: siNotion,
    app: "Notion",
    context: "Comptes rendus",
    title: "Point chantier",
    detail: "Notes à mettre au propre",
    fields: [
      { label: "Participants", value: "4" },
      { label: "Suite", value: "À répartir" },
    ],
    task: "Compte rendu du point chantier rédigé",
    meta: "Notion · 09:52",
    status: { tone: "done", label: "Fait" },
  },
];
