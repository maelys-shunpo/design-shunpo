import type { QuestionPlates } from "@repo/ui/agents/question-night";

/* The home page's question, asked in the night; it rises to the top and the four pains of a PME's head rise into a row
   under it, then the answer comes on paper. */
export const problemQuestion = "Votre entreprise grandit et vos outils ne suivent plus ?";

export const problemPlates: QuestionPlates = [
  {
    icon: "time",
    title: "Vous perdez du temps",
    text: "Un devis dans un outil, la facture dans un autre, et la bonne information à chercher entre mails, WhatsApp et Drive.",
  },
  {
    icon: "departure",
    title: "La mémoire part avec les gens",
    text: "Un départ, des congés, un changement de poste : le contexte d’un client s’en va avec celui qui le portait.",
  },
  {
    icon: "hidden",
    title: "Vous pilotez à l’aveugle",
    text: "Quand vous voyez un problème, il a déjà coûté.",
  },
  {
    icon: "restart",
    title: "Chaque IA repart de zéro",
    text: "ChatGPT ou Claude ne connaissent ni vos clients ni vos projets. Vos équipes recollent le contexte à la main, à chaque question.",
  },
];

export const problemAnswer = [
  ["Vos outils devraient", "vous faire gagner du temps."],
  ["Pas vous en faire perdre."],
] as const;

/* The word the answer is about, set between ink brackets as « Immersion » is in the method's title. */
export const problemKeyword = "perdre";
