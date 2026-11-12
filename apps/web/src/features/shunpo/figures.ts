/* Each published reference's key figure and what it measures, by reference id: nothing beyond its case study's own
   words on shunpo.fr, except that an amount drops the case's « + » (« plus de »), which reads as a rise on a card;
   Vicat's « +30 % » keeps it, there it is one. */
export interface KeyFigure {
  figure: string;
  unit: string;
  label: string;
}

const figures: Record<string, KeyFigure> = {
  tf1: { figure: "1,4", unit: "M", label: "de téléspectateurs ont joué avec l’application" },
  altaroc: { figure: "1,6", unit: "Md€", label: "d’actifs suivis sur la plateforme" },
  lemlist: { figure: "5", unit: "M$", label: "de revenus récurrents par an" },
  vicat: { figure: "+30", unit: "%", label: "de trafic organique" },
  "ops-clean": {
    figure: "1",
    unit: "M€",
    label: "de chiffre d’affaires annuel, contre 150 k€ avant",
  },
};

export function keyFigureOf(id: string): KeyFigure | undefined {
  return figures[id];
}
