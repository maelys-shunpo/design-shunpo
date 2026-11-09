import type { WheelPhase } from "@repo/ui/agents/wheel-step";
import Image from "next/image";

import office from "./images/office-stone.webp";
import { AdoptBoard, AuditBoard, BuildBoard } from "./method-boards";

export const agentsMethodBackdrop = (
  <Image
    src={office}
    alt=""
    fill
    sizes="(min-width: 100rem) 40rem, (min-width: 64rem) 40vw, (min-width: 48rem) 50vw, 100vw"
  />
);

/* The three phases of a SHUNPO project, as on the home page (its kanji too): one invoice flow carried from phase to
   phase. */
export const agentsMethod: WheelPhase[] = [
  {
    id: "immersion",
    label: "5 jours auprès de vos équipes",
    title: "Immersion",
    kanji: "見",
    text: "On suit votre équipe pour comprendre où le travail ralentit et choisir avec vous le premier flux à automatiser.",
    deliverables: ["Carte des processus", "Heures perdues estimées", "Feuille de route priorisée"],
    panel: <AuditBoard />,
  },
  {
    id: "construction",
    label: "Brique par brique",
    title: "Construction",
    kanji: "築",
    text: "On construit un premier flux et on le teste avec votre équipe, du cas courant à la facture d’un fournisseur inconnu.",
    deliverables: ["Interface de suivi", "Outils connectés", "Agents configurés"],
    panel: <BuildBoard />,
  },
  {
    id: "evolution",
    label: "Après la mise en service",
    title: "Évolution",
    kanji: "進",
    text: "On regarde avec votre équipe ce qui se passe au quotidien. Un seuil à revoir ou un nouveau besoin devient la prochaine amélioration.",
    deliverables: ["Suivi des usages", "Maintenance des connexions", "Nouveaux flux"],
    panel: <AdoptBoard />,
  },
];
