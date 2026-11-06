import type { ComposerScenario } from "@repo/ui/agents/composer-plan";

/* Plans an agent would follow for common tasks. Illustrative: the diagnostic writes the real one. */
export const scenarios: ComposerScenario[] = [
  {
    id: "factures",
    label: "Saisir les factures fournisseurs",
    keywords: ["factur", "compta", "fournisseur", "saisi"],
    request: "Saisir les factures fournisseurs",
    title: "Plan : factures fournisseurs",
    steps: [
      { action: "Surveiller la boîte compta et ouvrir chaque pièce jointe", tool: "Gmail" },
      { action: "Extraire fournisseur, montants, TVA et échéance", tool: "Agent IA" },
      { action: "Contrôler les doublons et le compte analytique", tool: "Règles métier" },
      { action: "Créer la facture en brouillon", tool: "Odoo, Pennylane ou Sage" },
    ],
    human: "Valider les montants au-delà du seuil que vous fixez.",
  },
  {
    id: "relances",
    label: "Relancer les devis sans réponse",
    keywords: ["relan", "devis", "prospect", "commercial"],
    request: "Relancer les devis sans réponse",
    title: "Plan : relance des devis",
    steps: [
      { action: "Lister chaque matin les devis envoyés il y a plus de 7 jours", tool: "CRM" },
      { action: "Relire l’historique des échanges avec le client", tool: "Agent IA" },
      { action: "Rédiger une relance personnalisée en brouillon", tool: "Gmail ou Outlook" },
      { action: "Mettre à jour l’étape de l’affaire", tool: "HubSpot ou Pipedrive" },
    ],
    human: "Relire et envoyer la relance, ou l’ajuster.",
  },
  {
    id: "support",
    label: "Répondre aux questions clients",
    keywords: ["client", "support", "sav", "question", "réclam"],
    request: "Répondre aux questions clients",
    title: "Plan : premier niveau de support",
    steps: [
      {
        action: "Lire chaque message entrant, quel que soit le canal",
        tool: "E-mail, chat, WhatsApp",
      },
      { action: "Chercher la réponse dans vos documents et commandes", tool: "Agent IA" },
      { action: "Répondre en citant ses sources", tool: "Zendesk ou boîte partagée" },
      { action: "Transférer ce qui sort des règles avec un résumé", tool: "Équipe support" },
    ],
    human: "Traiter les cas sensibles et les gestes commerciaux.",
  },
  {
    id: "reporting",
    label: "Préparer le reporting du lundi",
    keywords: ["report", "tableau", "excel", "synth", "pilot", "kpi"],
    request: "Préparer le reporting du lundi",
    title: "Plan : reporting hebdomadaire",
    steps: [
      { action: "Lire les fichiers de suivi et l’outil de gestion", tool: "Sheets, Airtable, ERP" },
      { action: "Calculer les indicateurs que vous suivez déjà", tool: "Agent IA" },
      { action: "Rédiger une synthèse en cinq lignes", tool: "Agent IA" },
      { action: "L’envoyer à la direction le lundi à 7 h 30", tool: "E-mail ou Notion" },
    ],
    human: "Décider des actions à partir de la synthèse.",
  },
];

export const fallback: ComposerScenario = {
  id: "autre",
  label: "Autre tâche",
  keywords: [],
  request: "",
  title: "Plan : à préciser ensemble",
  steps: [
    { action: "Observer la tâche telle qu’elle est faite aujourd’hui", tool: "Diagnostic" },
    { action: "Repérer ce qui se répète et ce qui demande du jugement", tool: "Diagnostic" },
    { action: "Brancher un agent sur vos outils pour la partie répétitive", tool: "Agent IA" },
    { action: "Mesurer le temps rendu après un mois", tool: "Suivi" },
  ],
  human: "Garder les décisions, les relations et l’exception.",
};
