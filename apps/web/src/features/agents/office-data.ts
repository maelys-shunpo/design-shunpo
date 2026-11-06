/* What the back-office agent reads in the hero. Every name is fictitious and every amount illustrative:
   the mockup shows how the agent works, not a client's figures. */

type Tone = "done" | "working" | "waiting";

export interface Mail {
  from: string;
  subject: string;
  time: string;
  attachment?: string;
  status: string;
  tone: Tone;
}

export const inbox: Mail[] = [
  {
    from: "Métallerie Rhône-Alpes",
    subject: "Facture F-2026-1184, chantier Villeurbanne",
    time: "09:42",
    attachment: "F-2026-1184.pdf",
    status: "Traitée",
    tone: "done",
  },
  {
    from: "Transports Vercors",
    subject: "Avis de livraison et facture",
    time: "09:38",
    attachment: "AL-55102.pdf",
    status: "En cours",
    tone: "working",
  },
  {
    from: "Imprimerie Lumière",
    subject: "Relance : facture d’octobre",
    time: "09:21",
    status: "À valider",
    tone: "waiting",
  },
  {
    from: "Électricité Saône",
    subject: "Votre facture de novembre",
    time: "08:57",
    attachment: "ES-2611.pdf",
    status: "Traitée",
    tone: "done",
  },
  {
    from: "Fournitures Croix-Rousse",
    subject: "Commande 4471 livrée",
    time: "08:30",
    status: "Traitée",
    tone: "done",
  },
];

export const invoice = {
  issuer: "Métallerie Rhône-Alpes",
  address: "12 rue de l’Industrie, 69007 Lyon",
  kind: "Facture",
  reference: "N° F-2026-1184",
  date: "04/11/2026",
  lines: [
    { label: "Garde-corps acier, pose incluse", amount: "2 790,00 €" },
    { label: "Escalier hélicoïdal, fourniture", amount: "1 220,50 €" },
    { label: "TVA 20 %", amount: "802,10 €" },
  ],
  total: "4 812,60 €",
};

export const extracted = [
  { label: "Fournisseur", value: "Métallerie Rhône-Alpes", confidence: "99 %" },
  { label: "N° de facture", value: "F-2026-1184", confidence: "99 %" },
  { label: "Échéance", value: "04/12/2026", confidence: "97 %" },
  { label: "Montant HT", value: "4 010,50 €", confidence: "99 %" },
  { label: "TVA", value: "802,10 €", confidence: "99 %" },
  { label: "Compte analytique", value: "Chantier Villeurbanne", confidence: "88 %", flagged: true },
];
