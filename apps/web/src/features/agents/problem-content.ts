import type { QuestionPlates } from "@repo/ui/agents/question-night";

/* The home page's question, asked in the night with the four pains around it, then answered on paper. */
export const problemQuestion = "Votre entreprise grandit et vos outils ne suivent plus ?";

export const problemPlates: QuestionPlates = [
  {
    number: "01",
    title: "Vous ressaisissez les mêmes données",
    text: "Un devis dans un outil, la facture dans un autre, le suivi dans un Excel à rallonge.",
  },
  {
    number: "02",
    title: "Vous perdez du temps à chercher la bonne information",
    text: "Mails, WhatsApp, Excel, Drive : vous ne savez plus où elle se trouve.",
  },
  {
    number: "03",
    title: "Tout repose sur une ou deux personnes",
    text: "Quand l’une d’elles est absente, tout ralentit.",
  },
  {
    number: "04",
    title: "Vous pilotez à l’aveugle",
    text: "Quand vous voyez un problème, il a déjà coûté.",
  },
];

export const problemAnswer = [
  ["Vos outils devraient", "vous faire gagner du temps."],
  ["Pas vous en faire perdre."],
] as const;
