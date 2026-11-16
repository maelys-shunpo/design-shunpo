/* The facts every proposal tells, in SHUNPO's voice: taken from the strategic brief, nothing invented.
   Each page writes its own headlines around them; the facts stay identical from one page to the next. */

export const contactUrl = "https://shunpo.fr/contact";
export const casesUrl = "https://shunpo.fr/cas-clients";

export const promise = "SHUNPO vous libère du temps.";
export const conviction =
  "La technologie doit s’adapter à l’entreprise, pas l’entreprise à la technologie.";

export interface Symptom {
  id: string;
  title: string;
  detail: string;
}

/* The six families of problems the brief names, written as a manager lives them. */
export const symptoms: Symptom[] = [
  {
    id: "temps",
    title: "Des heures perdues à recopier",
    detail:
      "Copier des données, mettre à jour des tableaux, relancer, chercher une information. Utile, mais rarement à la hauteur du temps passé.",
  },
  {
    id: "outils",
    title: "Des outils qui ne se parlent pas",
    detail:
      "Les informations vivent dans plusieurs logiciels, tableurs et messageries. Chaque passage de l’un à l’autre crée un oubli ou une erreur.",
  },
  {
    id: "manuel",
    title: "Des process qui tiennent à une personne",
    detail:
      "Une habitude, un fichier, une manipulation que seul un collaborateur connaît. Tout ralentit quand il est absent.",
  },
  {
    id: "standard",
    title: "Des logiciels qui imposent leur façon de travailler",
    detail:
      "Trop rigides, trop complexes, jamais tout à fait adaptés. L’équipe s’organise autour de l’outil au lieu de l’inverse.",
  },
  {
    id: "competences",
    title: "Des idées sans équipe pour les construire",
    detail:
      "Le besoin est clair. Les ressources techniques pour concevoir et développer la solution manquent en interne.",
  },
  {
    id: "ia",
    title: "L’IA, sans savoir par où commencer",
    detail:
      "Distinguer ce qui sert vraiment les opérations de ce qui impressionne en démonstration.",
  },
];

export interface Expertise {
  id: string;
  index: string;
  title: string;
  outcome: string;
  detail: string;
  scope: string[];
  example: string;
}

export const expertises: Expertise[] = [
  {
    id: "ia",
    index: "01",
    title: "Intelligence artificielle et automatisation",
    outcome: "Les tâches répétitives se font seules.",
    detail:
      "Nous transformons des process manuels et fragmentés en systèmes automatisés et fiables. L’IA intervient là où sa valeur se démontre, avec une validation humaine pour les décisions sensibles.",
    scope: [
      "Audit des process",
      "Agents IA",
      "Extraction de données",
      "Relances automatiques",
      "CRM, ERP et messagerie connectés",
      "Documents et rapports générés",
    ],
    example:
      "Des dizaines de documents arrivent chaque jour par e-mail. Le système les récupère, extrait les données, les range dans les bons outils et demande une validation quand il le faut.",
  },
  {
    id: "logiciels",
    index: "02",
    title: "Logiciels métier et applications sur mesure",
    outcome: "Un outil qui suit votre façon de travailler.",
    detail:
      "Quand les outils communiquent mal, quand tout repose sur des fichiers Excel ou qu’aucun logiciel standard ne colle à votre métier, nous concevons celui qu’il vous faut.",
    scope: [
      "Gestion interne",
      "Applications web et mobiles",
      "CRM sur mesure",
      "Portails clients",
      "Tableaux de bord",
      "Plateformes SaaS",
    ],
    example:
      "Une entreprise du BTP suit ses chantiers entre des plannings Excel, un logiciel de facturation et une messagerie. Une seule application centralise tout et automatise les échanges.",
  },
  {
    id: "sites",
    index: "03",
    title: "Sites web et expériences digitales",
    outcome: "Un site qui travaille pour votre développement.",
    detail:
      "Stratégie, UX, développement et performance. Un site sert la visibilité, la crédibilité et l’acquisition, et se connecte à vos outils commerciaux.",
    scope: [
      "Stratégie et conception",
      "UX et UI design",
      "Développement sur mesure",
      "E-commerce",
      "SEO et GEO",
      "Maintenance",
    ],
    example:
      "Un site connecté au CRM : chaque demande arrive qualifiée chez le bon commercial, sans ressaisie.",
  },
];

export interface MethodStep {
  id: string;
  index: string;
  title: string;
  detail: string;
}

export const method: MethodStep[] = [
  {
    id: "comprendre",
    index: "01",
    title: "Comprendre et auditer",
    detail:
      "Nous regardons comment votre entreprise fonctionne vraiment : outils, process, frictions, besoins des équipes. Puis nous estimons l’impact de chaque piste avant d’écrire une ligne de code.",
  },
  {
    id: "concevoir",
    index: "02",
    title: "Concevoir et intégrer",
    detail:
      "Chefs de projet, designers et développeurs traduisent le besoin en solution. Nouvel outil, logiciels connectés, process automatisé ou agent IA : tout est testé avant la mise en production.",
  },
  {
    id: "accompagner",
    index: "03",
    title: "Accompagner et former",
    detail:
      "Vos équipes comprennent la solution, savent l’utiliser et la faire évoluer. Documentation fournie. Vous restez maîtres de vos outils.",
  },
];

export interface Reference {
  id: string;
  name: string;
  project: string;
  stake: string;
  /* What the mission was, in one sentence built only from the project and its stake. */
  mission: string;
  href: string;
}

/* Published references only, described as the brief describes them; their key figures live in `figures.ts`. */
export const references: Reference[] = [
  {
    id: "tf1",
    name: "TF1",
    project: "Application de jeu d’une émission en prime time",
    stake: "Trafic massif et montée en charge en direct",
    mission:
      "L’application de jeu d’une émission en prime time, conçue pour tenir un trafic massif en direct.",
    href: "https://shunpo.fr/cas-clients/tf1-application-grand-quiz",
  },
  {
    id: "altaroc",
    name: "Altaroc",
    project: "Plateforme d’investissement",
    stake: "Données sensibles et exigence de fiabilité",
    mission:
      "Une plateforme d’investissement qui manie des données sensibles avec une exigence de fiabilité.",
    href: "https://shunpo.fr/cas-clients/altaroc",
  },
  {
    id: "lemlist",
    name: "lemlist",
    project: "Plateforme d’affiliation",
    stake: "Outils web et automatisations combinés",
    mission: "Une plateforme d’affiliation qui combine outils web et automatisations.",
    href: "https://shunpo.fr/cas-clients/agence-webflow-lemlist-developpement",
  },
  {
    id: "vicat",
    name: "Groupe Vicat",
    project: "Expérience web",
    stake: "Visibilité et performance SEO",
    mission: "Une expérience web conçue pour gagner en visibilité et en performance SEO.",
    href: "https://shunpo.fr/cas-clients/vicat",
  },
  {
    id: "ops-clean",
    name: "Ops Clean",
    project: "Infrastructure e-commerce",
    stake: "Évolution de la marque en ligne",
    mission: "Une infrastructure e-commerce qui fait évoluer la marque en ligne.",
    href: "https://shunpo.fr/cas-clients/ops-clean",
  },
];

export interface Objection {
  id: string;
  question: string;
  answer: string;
}

export const objections: Objection[] = [
  {
    id: "adapte",
    question: "Je ne sais pas si l’IA est adaptée à mon entreprise.",
    answer:
      "Toutes les entreprises n’ont pas besoin des mêmes solutions. L’Immersion sert justement à repérer les cas d’usage utiles chez vous, et à écarter les autres.",
  },
  {
    id: "adoption",
    question: "J’ai peur d’investir dans un outil que personne n’utilisera.",
    answer:
      "Nous partons des usages réels de vos équipes et nous les formons. Un outil est terminé quand il fait partie du quotidien, pas quand il est livré.",
  },
  {
    id: "logiciels",
    question: "Nous avons déjà beaucoup de logiciels.",
    answer:
      "Tant mieux. Souvent, la valeur vient de connecter et d’améliorer ce qui existe, sans tout remplacer.",
  },
  {
    id: "dependance",
    question: "Je ne veux pas dépendre d’un prestataire.",
    answer:
      "Documentation, transmission, formation : nous construisons des solutions que vos équipes comprennent et peuvent faire évoluer.",
  },
  {
    id: "technique",
    question: "Je ne suis pas assez technique pour piloter ce projet.",
    answer:
      "Nous prenons en charge le cadrage et le développement. Vous comprenez chaque décision importante, dans vos mots.",
  },
  {
    id: "retour",
    question: "Comment être sûr du retour sur investissement ?",
    answer:
      "Nous commençons par des problèmes identifiables, nous priorisons les pistes selon leur impact et nous mesurons les bénéfices quand c’est possible.",
  },
];

export const values = [
  { id: "transparence", kanji: "透", name: "Transparence" },
  { id: "rigueur", kanji: "律", name: "Rigueur" },
  { id: "excellence", kanji: "極", name: "Excellence" },
  { id: "humanite", kanji: "人", name: "Humanité" },
  { id: "autonomie", kanji: "立", name: "Autonomie" },
  { id: "innovation", kanji: "新", name: "Innovation utile" },
] as const;
