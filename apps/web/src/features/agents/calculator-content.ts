import type { CalculatorModel } from "@repo/ui/agents/calculator-model";

/* The lost-hours calculator for a general SMB, one screen a question (calculateur-heures-perdues.md).
   Head counts and weekly-hour brackets take the brief's low values; the five measured tasks (5 to 9)
   carry its prudent automation rates. Only the team size and those five tasks feed the figures; the
   other questions qualify the lead. */

/* Each weekly-time bracket, converted to the low value the brief uses to stay prudent. */
const hours = [
  { value: "lt1", label: "Moins d’1 h", amount: 0.5 },
  { value: "1-3", label: "1 à 3 h", amount: 2 },
  { value: "3-5", label: "3 à 5 h", amount: 4 },
  { value: "5-8", label: "5 à 8 h", amount: 6.5 },
  { value: "gt8", label: "Plus de 8 h", amount: 8 },
];

export const calculatorModel: CalculatorModel = {
  team: "team",
  tasks: [
    { question: "retyping", rate: 0.4, title: "Saisie et ressaisie" },
    { question: "chasing", rate: 0.6, title: "Relances" },
    { question: "mail", rate: 0.3, title: "Emails et demandes" },
    { question: "reports", rate: 0.5, title: "Reportings" },
    { question: "admin", rate: 0.5, title: "Devis et factures" },
  ],
  questions: [
    {
      id: "team",
      prompt: "Combien de personnes dans votre équipe ?",
      kind: "single",
      options: [
        { value: "1-5", label: "1 à 5", amount: 3 },
        { value: "6-15", label: "6 à 15", amount: 10 },
        { value: "16-30", label: "16 à 30", amount: 22 },
        { value: "31-60", label: "31 à 60", amount: 45 },
        { value: "60+", label: "Plus de 60", amount: 60 },
      ],
    },
    {
      id: "sector",
      prompt: "Votre secteur ?",
      kind: "single",
      options: [
        { value: "accounting", label: "Cabinet comptable" },
        { value: "property", label: "Gestion immobilière" },
        { value: "construction", label: "BTP" },
        { value: "agency", label: "Agence" },
        { value: "trade", label: "Commerce ou industrie" },
        { value: "services", label: "Services" },
        { value: "other", label: "Autre" },
      ],
    },
    {
      id: "role",
      prompt: "Votre rôle ?",
      kind: "single",
      options: [
        { value: "owner", label: "Dirigeant ou associé" },
        { value: "manager", label: "Manager" },
        { value: "staff", label: "Collaborateur" },
        { value: "other", label: "Autre" },
      ],
    },
    {
      id: "tools",
      prompt: "Vos outils aujourd’hui ?",
      kind: "multi",
      options: [
        { value: "erp", label: "Logiciel de gestion ou ERP" },
        { value: "crm", label: "CRM" },
        { value: "accounting", label: "Logiciel comptable" },
        { value: "excel", label: "Excel partagés" },
        { value: "nocode", label: "Outils no-code" },
        { value: "other", label: "Autre" },
      ],
    },
    {
      id: "retyping",
      prompt: "Saisie et ressaisie d’informations entre vos outils ?",
      kind: "single",
      options: hours,
    },
    {
      id: "chasing",
      prompt: "Relances : devis, paiements, pièces manquantes ?",
      kind: "single",
      options: hours,
    },
    {
      id: "mail",
      prompt: "Tri et traitement des emails et des demandes ?",
      kind: "single",
      options: hours,
    },
    {
      id: "reports",
      prompt: "Reportings et tableaux de bord ?",
      kind: "single",
      options: hours,
    },
    {
      id: "admin",
      prompt: "Devis, factures et documents administratifs ?",
      kind: "single",
      options: hours,
    },
    {
      id: "processes",
      prompt: "Où vivent vos process aujourd’hui ?",
      kind: "single",
      options: [
        { value: "connected", label: "Surtout dans des outils connectés" },
        { value: "mixed", label: "Un mélange d’outils et d’Excel" },
        { value: "manual", label: "Surtout dans Excel et les emails" },
      ],
    },
    {
      id: "project",
      prompt: "Un projet pour réduire ce temps dans les 6 mois ?",
      kind: "single",
      options: [
        { value: "funded", label: "Lancé ou budgété" },
        { value: "thinking", label: "En réflexion" },
        { value: "none", label: "Pas pour l’instant" },
      ],
    },
  ],
};

/* The questions 5 to 9 share a lead-in, shown once above the bracket choices. */
export const hoursLeadIn = "Par personne et par semaine, combien de temps pour…";
