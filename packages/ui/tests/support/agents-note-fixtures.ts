import { siGmail } from "simple-icons";

import type { WeekTask } from "../../src/agents/hero-semaine-choreography.ts";
import type { WeekJournal } from "../../src/agents/hero-semaine-journal.tsx";
import type { OsDecision } from "../../src/agents/os-model.ts";

/* A routine of the week, its journal and a decision of the owner's system, as the borders tests render them. */
export const weekTask: WeekTask = {
  id: "relances",
  day: 0,
  start: 0,
  end: 2,
  title: "Relances",
  routine: { tool: siGmail, done: "Relances envoyées", at: "09:12" },
};

export const weekJournal: WeekJournal = {
  title: "Journal",
  idle: "Prêt lundi 09:00",
  approval: { initials: "SB", text: "Valider l’avoir", detail: "120 €", status: "À valider" },
};

export const decision: OsDecision = {
  id: "payer",
  area: "today",
  title: "Facture Métallerie",
  detail: "2 400 €",
  reason: "Au-delà de votre seuil",
  action: "Payer la facture",
  follow: { at: "09:50", tool: siGmail, text: "Payée" },
};
