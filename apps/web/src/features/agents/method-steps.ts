/* The three phases of a SHUNPO project, as on the home page. Each one ends with what the client receives. */
export const agentsMethod = [
  {
    id: "immersion",
    index: "01",
    name: "Immersion",
    detail:
      "SHUNPO observe le travail des équipes, les outils utilisés et les tâches qui leur prennent du temps. À l’issue de l’Immersion, le client reçoit une carte de ses processus, une estimation des heures perdues et une feuille de route priorisée. On choisit ensemble le premier flux à automatiser.",
    delivers: ["Carte des processus", "Heures perdues estimées", "Feuille de route priorisée"],
  },
  {
    id: "construction",
    index: "02",
    name: "Construction",
    detail:
      "SHUNPO crée l’interface, connecte les outils existants et configure les agents, brique par brique. L’équipe teste chaque parcours avec ses cas métier, y compris les exceptions et les validations humaines.",
    delivers: ["Interface", "Outils connectés", "Agents configurés"],
  },
  {
    id: "evolution",
    index: "03",
    name: "Évolution",
    detail:
      "Après la mise en service, SHUNPO accompagne l’équipe, maintient les connexions et ajuste les agents au fil des usages. Quand les règles ou les besoins changent, on fait évoluer le flux ou on ajoute une nouvelle brique.",
    delivers: ["Accompagnement", "Maintenance des connexions", "Nouvelles briques"],
  },
] as const;
