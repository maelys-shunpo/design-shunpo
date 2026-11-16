import type { Plate } from "./stills";

/* The story of the journey: each gesture of folding is a real step in building software. One chapter per
   shot of the studio, in the order the camera meets the paper. */
export interface Step {
  id: string;
  index: string;
  title: string;
  accent: string;
  body: string;
  plate: Plate;
}

export const steps: Step[] = [
  {
    id: "patron",
    index: "02 · Le patron",
    title: "Avant de plier, on trace",
    accent: "tous les plis.",
    body: "Nous regardons comment votre entreprise fonctionne vraiment, puis nous dessinons la solution : les écrans, les données, les connexions. Chaque pli est décidé avant d’être marqué. C’est la conception.",
    plate: "pattern",
  },
  {
    id: "base",
    index: "03 · La base",
    title: "Une base solide, d’où naissent",
    accent: "tous les modèles.",
    body: "En origami, une même base sert à plier de nombreuses formes. Dans un logiciel, c’est le socle : les données, les connexions entre vos outils, la sécurité. Il se construit une fois et sert à tout le reste.",
    plate: "base",
  },
  {
    id: "modules",
    index: "04 · Les modules",
    title: "Chaque brique est simple.",
    accent: "L’assemblage fait la solidité.",
    body: "Chaque module se plie seul, puis s’emboîte dans les autres. Aucun ne tient sans le pli de son voisin : c’est ce qui rend l’ensemble solide.",
    plate: "modules",
  },
  {
    id: "forme",
    index: "05 · La forme",
    title: "La forme apparaît",
    accent: "pli après pli.",
    body: "Itérations, tests, retours de vos équipes : l’application se précise jusqu’à devenir l’outil qu’elles utilisent chaque jour.",
    plate: "crane",
  },
  {
    id: "lancement",
    index: "06 · Le lancement",
    title: "Puis elle",
    accent: "s’envole.",
    body: "La mise en production se prépare comme un dernier pli : avec soin, sans casser ce qui tourne déjà.",
    plate: "launch",
  },
  {
    id: "suite",
    index: "07 · Ce qui suit",
    title: "Et elle ne vole",
    accent: "jamais seule.",
    body: "Nous formons vos équipes, nous documentons chaque pli et nous faisons évoluer l’outil avec vous. Vous restez maîtres de ce qui a été construit.",
    plate: "flock",
  },
];

export const moduleNames = [
  "Authentification",
  "CRM",
  "Paiement",
  "Agent IA",
  "Tableau de bord",
  "Notifications",
] as const;
