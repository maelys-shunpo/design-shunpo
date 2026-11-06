import type { AgentTab } from "@repo/ui/agents/agent-tabs";
import { PhotoStage } from "@repo/ui/agents/photo-stage";
import Image from "next/image";
import type { ReactNode } from "react";

import office from "./images/office-stone.webp";
import { AdoptBoard, AuditBoard, BuildBoard } from "./method-boards";

const SIZES = "(min-width: 100rem) 100rem, 100vw";

function stage(board: ReactNode) {
  return (
    <PhotoStage
      padding="md"
      width="narrow"
      backdrop={<Image src={office} alt="" fill sizes={SIZES} />}
    >
      {board}
    </PhotoStage>
  );
}

/* The three phases of a SHUNPO project, as on the home page: one invoice flow carried from phase to phase. */
export const agentsMethod: AgentTab[] = [
  {
    id: "immersion",
    kicker: "Phase 01 · Le projet commence ici",
    title: "Immersion",
    description:
      "SHUNPO observe le travail des équipes, les outils utilisés et les tâches qui leur prennent du temps. À l’issue de l’Immersion, le client reçoit une carte de ses processus, une estimation des heures perdues et une feuille de route priorisée. On choisit ensemble le premier flux à automatiser.",
    details: ["Carte des processus", "Heures perdues estimées", "Feuille de route priorisée"],
    panel: stage(<AuditBoard />),
  },
  {
    id: "construction",
    kicker: "Phase 02",
    title: "Construction",
    description:
      "SHUNPO crée l’interface, connecte les outils existants et configure les agents, brique par brique. L’équipe teste chaque parcours avec ses cas métier, y compris les exceptions et les validations humaines.",
    details: ["Interface", "Outils connectés", "Agents configurés"],
    panel: stage(<BuildBoard />),
  },
  {
    id: "evolution",
    kicker: "Phase 03",
    title: "Évolution",
    description:
      "Après la mise en service, SHUNPO accompagne l’équipe, maintient les connexions et ajuste les agents au fil des usages. Quand les règles ou les besoins changent, on fait évoluer le flux ou on ajoute une nouvelle brique.",
    details: ["Accompagnement", "Maintenance des connexions", "Nouvelles briques"],
    panel: stage(<AdoptBoard />),
  },
];
