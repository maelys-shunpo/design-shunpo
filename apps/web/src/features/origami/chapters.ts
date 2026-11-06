import { expertises } from "@/features/shunpo/content";

/* The copy of the journey, chapter by chapter, in the order the camera meets the paper. */
export const sheetChapter = {
  index: "I · La feuille",
  title: "Une feuille, quelques plis.",
  body: "Chaque entreprise a ses feuilles volantes : des saisies, des relances, des fichiers qui passent de main en main. Nous les regardons d’abord à plat, avant de marquer le moindre pli.",
};

export const flightChapter = {
  index: "II · L’envol",
  title: "Ce qui se répète",
  emphasis: "s’envole.",
  body: "Plié juste, un process part tout seul. Vos équipes gardent leur temps pour ce qui demande leur jugement.",
};

/* Each expertise is carried by one piece: the crane for the agents, the box for business software, the boat
   for the websites that take a company out to its clients. */
const pieces = ["La grue", "La boîte", "Le bateau"] as const;

export const pieceChapters = expertises.map((expertise, index) => ({
  expertise,
  piece: pieces[index] ?? "",
}));

export const flockChapter = {
  index: "III · La volée",
  title: "Des pièces qui volent",
  emphasis: "ensemble.",
  body: "Les trois se combinent. Un process automatisé d’abord, puis l’application métier qui le porte, puis le site qui l’ouvre à vos clients.",
};
