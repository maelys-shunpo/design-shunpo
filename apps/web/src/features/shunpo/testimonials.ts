export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  position: string;
  initials: string;
}

/* Published on shunpo.fr, word for word, shown two by two (checked on 9 November 2026), with the ratings shown on the same page. */
export const testimonials: Testimonial[] = [
  {
    id: "lemlist",
    quote:
      "Nous avons travaillé avec Shunpo dans un projet « time sensitive » et ils ont tenu les promesses faites lors de nos échanges commerciaux. On recommande à 100 %.",
    author: "Simon Brossard",
    position: "Chief Business Officer, lemlist",
    initials: "SB",
  },
  {
    id: "revoltrain",
    quote:
      "Qualité, rigueur, rapidité et conseils de dingues. SHUNPO nous a fait économiser tellement de temps et d’argent que c’est désormais notre agence de référence pour tous nos projets techs. Merci les gars !",
    author: "Corentin Lambert",
    position: "CEO, Revoltrain",
    initials: "CL",
  },
  {
    id: "ops-clean",
    quote:
      "Entreprise très compétente et à l’écoute de nos demandes. Je ne savais pas quelle plateforme choisir avec la multitude de produits disponibles, l’équipe a su m’orienter vers la solution la plus adaptée pour notre entreprise, et nous sommes extrêmement satisfaits ! Encore merci à l’équipe Shunpo !",
    author: "Marc Biessy",
    position: "CEO, Ops Clean",
    initials: "MB",
  },
  {
    id: "insiders",
    quote: "Excellente prestation proactive, rien à redire, c’est top de chez top comme agence !",
    author: "Thomas Chabrieres",
    position: "CEO, Insiders Experiences",
    initials: "TC",
  },
  {
    id: "fondation-donnadieu",
    quote:
      "Équipe super performante, sympathique et honnête ! Je suis très exigeant, et ils ont su m’apporter le plus haut degré de satisfaction. Bravo et merci à vous. Je vous recommande XXL +++",
    author: "Ludovic Donnadieu",
    position: "Directeur Général, Fondation Donnadieu",
    initials: "LD",
  },
  {
    id: "initial-labo",
    quote:
      "Sam et Maxime ont fait un excellent travail en implémentant deux nouvelles fonctionnalités sur notre projet, avec des solutions techniques adaptées et efficaces. Communication claire, délais respectés, et en prime, une belle réactivité. Je recommande sans hésiter !",
    author: "Helene Allain",
    position: "Directrice de la communication, Initial Labo",
    initials: "HA",
  },
];

export const ratings = { trustpilot: "4,6", malt: "5,0" } as const;

export const trustpilotUrl = "https://fr.trustpilot.com/review/shunpo.fr";
