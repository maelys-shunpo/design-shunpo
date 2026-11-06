import type { DrawingState } from "@repo/ui/instant/state-captions";

/* The words of the Instant page around the shared facts (../shunpo/content.ts). */

export const navigation = [
  { id: "constat", label: "Le constat" },
  { id: "expertises", label: "Expertises" },
  { id: "methode", label: "Méthode" },
  { id: "references", label: "Références" },
  { id: "questions", label: "Questions" },
] as const;

export const primaryAction = "Réserver un diagnostic";

export const heroKicker = "Agence IA, automatisation et logiciels sur mesure · Lyon";

export const heroLead =
  "Automatisations, agents IA, logiciels métier : nous retirons de vos journées ce qui se répète, pour que vos équipes gardent leur temps pour ce qui demande leur jugement.";

/* One caption per drawing of the signature scene, in the order the ink jumps. */
export const drawingStates: DrawingState[] = [
  {
    id: "semaine",
    title: "Votre semaine.",
    text: "Pleine. Saisies, relances, copier-coller d’un outil à l’autre.",
  },
  {
    id: "outils",
    title: "Vos outils.",
    text: "CRM, tableurs, messagerie, facturation. Chacun dans son coin.",
  },
  {
    id: "systeme",
    title: "Un système.",
    text: "Nous les relions. L’information circule seule, les tâches répétitives se font sans vous.",
  },
  {
    id: "temps",
    title: "Votre temps.",
    text: "Il reste ce qui compte : décider, vendre, accompagner vos équipes.",
  },
];

export const purchases = [
  { id: "agent", sold: "Un agent IA", bought: "Des tâches qui se font seules." },
  {
    id: "logiciel",
    sold: "Un logiciel métier",
    bought: "Une organisation qui ne perd plus de temps.",
  },
  { id: "site", sold: "Un site web", bought: "Des clients qui vous trouvent." },
  {
    id: "automatisation",
    sold: "Des automatisations",
    bought: "Moins d’erreurs, plus aucune ressaisie.",
  },
] as const;

/* The method as three kanji down the margin: to observe, to build, to hand on. */
const methodKanji = new Map([
  ["comprendre", { kanji: "観", label: "Kan, observer" }],
  ["concevoir", { kanji: "築", label: "Chiku, construire" }],
  ["accompagner", { kanji: "伝", label: "Den, transmettre" }],
]);

export function kanjiFor(step: string): { kanji: string; label: string } {
  return methodKanji.get(step) ?? { kanji: "瞬", label: "Shun, l’instant" };
}

export const mentionsUrl = "https://shunpo.fr/pages-legales/mentions-legales";
