import type { DirectionName } from "@repo/ui/layout/direction";
import type { Route } from "next";

export interface Proposal {
  direction: DirectionName;
  href: Route;
  index: string;
  name: string;
  tagline: string;
  technique: string;
}

export const proposals: Proposal[] = [
  {
    direction: "instant",
    href: "/instant",
    index: "01",
    name: "Instant",
    tagline:
      "L’estampe et l’éclair. Le papier, l’encre, un sceau rouge. Votre semaine se réorganise d’un coup, comme le nom l’annonce.",
    technique: "Particules d’encre",
  },
  {
    direction: "mecanique",
    href: "/mecanique",
    index: "02",
    name: "Mécanique",
    tagline:
      "L’horlogerie de nuit. Un mouvement s’assemble pièce par pièce puis tourne seul : la précision d’un système fiable.",
    technique: "Calibre en 3D",
  },
  {
    direction: "fil",
    href: "/fil",
    index: "03",
    name: "Le fil",
    tagline:
      "Le tressage kumihimo. Des fils dispersés deviennent une seule tresse, et un fil rouge relie toute la page.",
    technique: "Shader de fils",
  },
];
