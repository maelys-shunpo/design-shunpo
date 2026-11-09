import altaroc from "./images/clients-altaroc.webp";
import carteNoire from "./images/clients-carte-noire.webp";
import donnadieu from "./images/clients-donnadieu.webp";
import insiders from "./images/clients-insiders.webp";
import tf1 from "./images/clients-tf1.webp";

/* Compact, near-square marks stand taller (53–62 px) to balance the wide wordmarks, as on the home page's band. */
export const compactMarks = {
  carteNoire: { name: "Carte Noire", image: carteNoire, width: 71, height: 62 },
  donnadieu: { name: "Fondation Donnadieu", image: donnadieu, width: 74, height: 62 },
  insiders: { name: "Insiders Experiences", image: insiders, width: 82, height: 53 },
  tf1: { name: "TF1", image: tf1, width: 86, height: 31 },
  altaroc: { name: "Altaroc", image: altaroc, width: 122, height: 25 },
};
