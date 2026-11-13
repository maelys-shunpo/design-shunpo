import type { OsDecision, OsQuestion, OsView } from "@repo/ui/agents/os-model";
import type { OsWindowLabels } from "@repo/ui/agents/os-window";
import {
  siCalendly,
  siGmail,
  siGooglesheets,
  siHubspot,
  siQuickbooks,
  siShopify,
  siZendesk,
} from "simple-icons";

/* The owner's screen on a Monday at 08:04, in their own words. Every figure is illustrative and fictitious;
   the window says « Prototype » and the section's copy repeats it. */
export const osViews: OsView[] = [
  {
    area: "today",
    label: "Ce matin",
    brief: "Le week-end, résumé. Deux décisions vous attendent, le reste est fait.",
    figures: [
      { value: "23", label: "tâches faites pendant le week-end" },
      { value: "2", label: "décisions vous attendent" },
      { value: "4", label: "logiciels reliés et à jour" },
    ],
    journal: [
      {
        at: "07:58",
        tool: siGmail,
        text: "Boîte commune triée : 3 factures, 2 demandes clients",
      },
      { at: "07:45", tool: siQuickbooks, text: "14 paiements rapprochés du relevé" },
      { at: "07:20", tool: siZendesk, text: "4 suivis de commande envoyés aux clients" },
      { at: "06:50", tool: siGooglesheets, text: "Planning de la semaine mis à jour" },
    ],
  },
  {
    area: "finance",
    label: "Trésorerie",
    brief: "Le point banque de ce matin, rapproché avec la compta.",
    figures: [
      { value: "86 400 €", label: "en banque ce matin" },
      { value: "12 400 €", label: "attendus cette semaine" },
      { value: "1", label: "facture à payer" },
    ],
    journal: [
      { at: "07:40", tool: siQuickbooks, text: "2 factures clients échues relancées" },
      { at: "07:30", tool: siGmail, text: "Facture Métallerie Rhône-Alpes extraite" },
      { at: "06:45", tool: siGooglesheets, text: "Prévisionnel de trésorerie mis à jour" },
    ],
  },
  {
    area: "sales",
    label: "Devis",
    brief: "Cinq devis dehors, chacun suivi. La relance la plus urgente attend votre accord.",
    figures: [
      { value: "5", label: "devis en attente de réponse" },
      { value: "46 200 €", label: "de devis en jeu" },
      { value: "9 jours", label: "sans réponse : Batimo" },
    ],
    journal: [
      { at: "07:35", tool: siHubspot, text: "Fiche Atelier Brunel complétée" },
      { at: "07:15", tool: siGmail, text: "2 relances préparées en brouillon" },
      { at: "06:30", tool: siCalendly, text: "3 créneaux proposés à un prospect" },
    ],
  },
  {
    area: "clients",
    label: "Clients",
    brief: "Les demandes du week-end sont traitées. Une seule a eu besoin d’un humain.",
    figures: [
      { value: "14", label: "demandes traitées" },
      { value: "2 min", label: "de première réponse" },
      { value: "1", label: "cas passé à l’équipe" },
    ],
    journal: [
      { at: "07:50", tool: siZendesk, text: "Commande 10482 suivie, client prévenu" },
      { at: "07:10", tool: siShopify, text: "Relivraison déclenchée" },
      { at: "06:20", tool: siGmail, text: "Litige passé à Sarah, dossier résumé" },
    ],
  },
];

/* The two moments only the owner decides; approving one writes its line into the journal. */
export const osDecisions: OsDecision[] = [
  {
    id: "payer",
    area: "finance",
    title: "Payer Métallerie Rhône-Alpes",
    detail: "Facture F-2026-1184 · 4 812,60 € TTC · échéance vendredi",
    reason: "Au-delà de votre seuil de 2 000 €",
    action: "Payer la facture",
    follow: {
      at: "08:05",
      tool: siQuickbooks,
      text: "Paiement F-2026-1184 programmé pour vendredi",
    },
  },
  {
    id: "relancer",
    area: "sales",
    title: "Relancer Batimo",
    detail: "Devis D-2114 · 18 300 € · envoyé il y a 9 jours",
    reason: "Grand compte : la relance part après votre lecture",
    action: "Envoyer la relance",
    follow: { at: "08:06", tool: siGmail, text: "Relance Batimo envoyée, le commercial en copie" },
  },
];

/* The three answers the prototype knows, and what it says otherwise. */
export const osQuestions: OsQuestion[] = [
  {
    id: "tresorerie",
    ask: "Où en est la trésorerie ?",
    keywords: ["tresor", "banque", "solde", "cash", "encaiss"],
    answer: "86 400 € en banque ce matin. 12 400 € attendus cette semaine, 3 factures à échéance.",
    sources: ["QuickBooks", "Google Sheets"],
  },
  {
    id: "devis",
    ask: "Quels devis sont sans réponse ?",
    keywords: ["devis", "relanc", "batimo", "vente", "prospect"],
    answer:
      "Cinq devis attendent une réponse, 46 200 € au total. Le plus ancien, Batimo, est relancé dès votre accord.",
    sources: ["HubSpot", "Gmail"],
  },
  {
    id: "commande",
    ask: "Où en est la commande 10482 ?",
    keywords: ["commande", "livraison", "colis", "client", "10482"],
    answer: "Repartie samedi après la relivraison, livraison prévue jeudi. Le client a le suivi.",
    sources: ["Shopify", "Zendesk"],
  },
];

export const osFallback: OsQuestion = {
  id: "autre",
  ask: "",
  keywords: [],
  answer:
    "Ce prototype ne connaît que trois sujets : la trésorerie, les devis, les commandes. Le vrai SHUNPO répond depuis vos outils, et cite ses sources.",
  sources: [],
};

export const osLabels: OsWindowLabels = {
  title: "Votre second cerveau",
  context: "Votre entreprise · lundi 08:04",
  note: "Prototype",
  nav: "Rubriques",
  pending: "à décider",
  decide: "À vous de décider",
  decided: "Fait. La ligne est au journal.",
  journal: "Ce que SHUNPO a fait",
  ask: {
    label: "Votre question",
    placeholder: "Ex. : où en est la trésorerie ?",
    submit: "Demander",
    suggestions: "Questions à essayer",
    you: "Vous",
    agent: "SHUNPO",
    note: "Prototype : réponses scriptées, chiffres fictifs. Le vrai SHUNPO lit vos outils et cite ses sources.",
  },
};
