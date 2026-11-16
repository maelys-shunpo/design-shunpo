/* The three operations the hero's calibre goes through, one per phase of its scroll. */
export const operations = [
  {
    id: "assembler",
    index: "Op. 01",
    title: "Assembler",
    detail: "Vos outils existants trouvent leur place. Nous relions avant d’ajouter.",
  },
  {
    id: "mettre-en-marche",
    index: "Op. 02",
    title: "Mettre en marche",
    detail: "Saisies, relances, documents : les tâches répétitives tournent seules.",
  },
  {
    id: "lire-l-heure",
    index: "Op. 03",
    title: "Rendre l’heure",
    detail: "Le temps revient à vos équipes, pour ce qui demande leur jugement.",
  },
] as const;
