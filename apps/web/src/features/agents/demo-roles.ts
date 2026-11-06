/* Who does what in the supplier-invoice example: each step names its actor, where it happens and its trace. */
export const demoRoles = [
  {
    id: "agent",
    actor: "L’agent",
    place: "Messagerie",
    action: "Lit la facture reçue par mail et en extrait les montants, l’échéance et le chantier.",
    trace: "D’après le mail du 6 nov. · 09:42 · F-2026-1184.pdf",
  },
  {
    id: "odoo",
    actor: "Odoo",
    place: "Votre ERP",
    action: "Reçoit un brouillon de facture fournisseur, prêt à être enregistré.",
    trace: "Brouillon FACT/2026/0918 · non comptabilisé",
  },
  {
    id: "claire",
    actor: "Claire",
    place: "Espace de travail SHUNPO",
    action:
      "Valide, parce que le montant dépasse le seuil de 2 000 € fixé par l’équipe. L’agent enregistre alors la facture.",
    trace: "Approuvée par Claire M. · 09:44",
  },
] as const;
