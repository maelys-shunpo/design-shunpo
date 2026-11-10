import type { WheelPhase } from "@repo/ui/agents/wheel-step";
import Image from "next/image";

import construction from "./images/method-construction.avif";
import evolution from "./images/method-evolution.avif";
import immersion from "./images/method-immersion.avif";

/* The phases' stills fill a square of five columns of twelve from desktops, four of eight on tablets, the whole width
   on phones. */
const STILL_SIZES =
  "(min-width: 100rem) 40rem, (min-width: 64rem) 40vw, (min-width: 48rem) 50vw, 100vw";

/* A phase's still: folded paper on the page, the frame the method's film rests on. Decorative: the copy says it. */
function still(source: typeof immersion) {
  return <Image src={source} alt="" fill sizes={STILL_SIZES} />;
}

/* The three phases of a SHUNPO project, as on the home page (its kanji too), each with its paper still: the
   handshake, the bridge, the bonsai. */
export const agentsMethod: WheelPhase[] = [
  {
    id: "immersion",
    label: "5 jours auprès de vos équipes",
    title: "Immersion",
    kanji: "見",
    text: "On suit votre équipe pour comprendre où le travail ralentit et choisir avec vous le premier flux à automatiser.",
    deliverables: ["Carte des processus", "Heures perdues estimées", "Feuille de route priorisée"],
    panel: still(immersion),
  },
  {
    id: "construction",
    label: "Brique par brique",
    title: "Construction",
    kanji: "築",
    text: "On construit un premier flux et on le teste avec votre équipe, du cas courant à la facture d’un fournisseur inconnu.",
    deliverables: ["Interface de suivi", "Outils connectés", "Agents configurés"],
    panel: still(construction),
  },
  {
    id: "evolution",
    label: "Après la mise en service",
    title: "Évolution",
    kanji: "進",
    text: "On regarde avec votre équipe ce qui se passe au quotidien. Un seuil à revoir ou un nouveau besoin devient la prochaine amélioration.",
    deliverables: ["Suivi des usages", "Maintenance des connexions", "Nouveaux flux"],
    panel: still(evolution),
  },
];
