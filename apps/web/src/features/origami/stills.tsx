import Image, { type StaticImageData } from "next/image";

import boat from "./images/still-boat.webp";
import crane from "./images/still-crane.webp";
import flock from "./images/still-flock.webp";
import masu from "./images/still-masu.webp";
import plane from "./images/still-plane.webp";
import sheet from "./images/still-sheet.webp";

/* The folds as still plates, captured from the studio: what each chapter shows under reduced motion. */
const plates = {
  sheet: { src: sheet, alt: "Une feuille de papier ivoire, son premier coin à peine relevé." },
  plane: { src: plane, alt: "La feuille pliée en avion de papier, prête à partir." },
  crane: { src: crane, alt: "Une grue en papier citron, les ailes levées, le cou dressé." },
  masu: { src: masu, alt: "Une boîte masu pliée, cobalt dehors, blanche dedans." },
  boat: { src: boat, alt: "Un bateau de papier ivoire, sa voile pliée en pointe." },
  flock: { src: flock, alt: "Une volée d’avions en papier qui traverse le ciel du studio." },
} satisfies Record<string, { src: StaticImageData; alt: string }>;

export type Plate = keyof typeof plates;

export function Still({ plate }: { plate: Plate }) {
  const { src, alt } = plates[plate];
  return <Image src={src} alt={alt} sizes="(min-width: 64rem) 50vw, 100vw" />;
}
