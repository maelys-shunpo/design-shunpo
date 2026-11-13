import { ApprovalCard } from "@repo/ui/agents/approval-card";
import type { CouchesAgent, CouchesWorkspace } from "@repo/ui/agents/hero-couches-layers";
import { ToolCall } from "@repo/ui/agents/tool-call";
import { siGmail, siGooglesheets, siHubspot, siNotion, siOdoo, siShopify } from "simple-icons";

/* The SHUNPO interface of the hero « Vue éclatée »: the morning's tasks, each in the tool it touched. The invoice
   is the one the example below follows; the amounts are illustrative. */
export const couchesWorkspace: CouchesWorkspace = {
  title: "Espace de travail",
  context: "Back-office · Lyon",
  status: "En service",
  heading: "Aujourd’hui",
  tasks: [
    {
      icon: siGmail,
      text: "Facture F-2026-1184 lue et extraite",
      time: "09:42",
      tone: "done",
      status: "Fait",
    },
    {
      icon: siOdoo,
      text: "Brouillon créé dans Odoo",
      time: "09:43",
      tone: "working",
      status: "En cours",
      settled: "Fait",
    },
    {
      icon: siHubspot,
      text: "Relance du devis Durand préparée",
      time: "09:51",
      tone: "done",
      status: "Fait",
    },
    {
      icon: siShopify,
      text: "Suivi de la commande 4821 envoyé",
      time: "10:05",
      tone: "done",
      status: "Fait",
    },
    {
      icon: siGooglesheets,
      text: "Tableau de bord du lundi",
      time: "10:12",
      tone: "working",
      status: "En cours",
    },
  ],
  aside: "Attend votre validation",
  approval: (
    <ApprovalCard
      reason="Montant supérieur à 2 000 €"
      detail="Métallerie Rhône-Alpes · F-2026-1184 · 4 812,60 € TTC"
      approve="Approuver"
      edit="Modifier"
    />
  ),
  approved: {
    reason: "Montant supérieur à 2 000 €",
    detail: "Métallerie Rhône-Alpes · F-2026-1184 · 4 812,60 € TTC",
    outcome: "Approuvé par Claire M. · 09:44",
    initials: "CM",
  },
  trail: (
    <ToolCall
      icon={siOdoo}
      tool="Odoo"
      action="Créer la facture fournisseur"
      result="Brouillon FACT/2026/0918, non comptabilisé"
    />
  ),
};

export const couchesAgents: CouchesAgent[] = [
  {
    name: "Agent factures",
    role: "Comptabilité fournisseurs",
    doing: "Prépare le brouillon",
  },
  { name: "Agent support", role: "Service client", doing: "Répond à un suivi" },
  { name: "Agent ventes", role: "Suivi commercial", doing: "Prépare une relance" },
];

/* One column of tools under each agent; the invoice lands in Odoo. */
export const couchesTools = [
  [siGmail, siOdoo],
  [siShopify, siNotion],
  [siHubspot, siGooglesheets],
];

export const couchesTarget = siOdoo.slug;

/* What each layer is, read beside it while the planes stand apart. */
export const couchesLabels = {
  you: {
    index: "01 · Vous",
    title: "Vous validez ce qui compte",
    detail: "Une seule interface montre ce qui est fait et ce qui vous attend.",
  },
  agents: {
    index: "02 · Les agents",
    title: "Ils agissent dans vos outils",
    detail: "Un agent par process, avec les règles écrites avec vous.",
  },
  tools: {
    index: "03 · Vos outils",
    title: "Rien à remplacer",
    detail: "Votre messagerie, votre CRM et votre ERP restent en place.",
  },
};
