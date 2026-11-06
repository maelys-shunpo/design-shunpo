import type { AgentTab } from "@repo/ui/agents/agent-tabs";
import Image from "next/image";

import office from "./images/office-stone.webp";
import { AdoptBoard, AuditBoard, BuildBoard } from "./method-boards";

export const agentsMethodBackdrop = (
  <Image
    src={office}
    alt=""
    fill
    sizes="(min-width: 100rem) 67rem, (min-width: 48rem) 67vw, 100vw"
  />
);

/* The three phases of a SHUNPO project, as on the home page: one invoice flow carried from phase to phase. */
export const agentsMethod: AgentTab[] = [
  {
    id: "immersion",
    kicker: "5 jours auprès de vos équipes",
    title: "Immersion",
    description:
      "On suit votre équipe pour comprendre où le travail ralentit et choisir avec vous le premier flux à automatiser.",
    details: ["Carte des processus", "Heures perdues estimées", "Feuille de route priorisée"],
    panel: <AuditBoard />,
  },
  {
    id: "construction",
    kicker: "Brique par brique",
    title: "Construction",
    description:
      "On construit un premier flux et on le teste avec votre équipe, du cas courant à la facture d’un fournisseur inconnu.",
    details: ["Interface de suivi", "Outils connectés", "Agents configurés"],
    panel: <BuildBoard />,
  },
  {
    id: "evolution",
    kicker: "Après la mise en service",
    title: "Évolution",
    description:
      "On regarde avec votre équipe ce qui se passe au quotidien. Un seuil à revoir ou un nouveau besoin devient la prochaine amélioration.",
    details: ["Suivi des usages", "Maintenance des connexions", "Nouveaux flux"],
    panel: <AdoptBoard />,
  },
];
