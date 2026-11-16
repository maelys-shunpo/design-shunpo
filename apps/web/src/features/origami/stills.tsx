import Image, { type StaticImageData } from "next/image";

import base from "./images/still-base.webp";
import crane from "./images/still-crane.webp";
import flock from "./images/still-flock.webp";
import launch from "./images/still-launch.webp";
import modules from "./images/still-modules.webp";
import pattern from "./images/still-pattern.webp";
import sheet from "./images/still-sheet.webp";

/* Each step of the story as a still plate, captured from the studio: what a chapter shows under reduced
   motion. */
const plates = {
  sheet: { src: sheet, alt: "Une feuille de papier blanche, un coin relevé vers la lumière." },
  pattern: { src: pattern, alt: "La feuille vue d’en haut, son patron de pliage tracé en tirets." },
  base: { src: base, alt: "La feuille plissée en étoile : la base d’où naissent les modèles." },
  modules: {
    src: modules,
    alt: "Six unités de papier emboîtées en cube, chacune portant le nom d’un module.",
  },
  crane: { src: crane, alt: "Une grue de papier orange, vue en contre-plongée." },
  launch: { src: launch, alt: "Un avion de papier blanc qui prend son envol." },
  flock: { src: flock, alt: "Une volée d’avions de papier au-dessus du studio." },
} satisfies Record<string, { src: StaticImageData; alt: string }>;

export type Plate = keyof typeof plates;

export function Still({ plate }: { plate: Plate }) {
  const { src, alt } = plates[plate];
  return <Image src={src} alt={alt} sizes="(min-width: 64rem) 50vw, 100vw" />;
}
