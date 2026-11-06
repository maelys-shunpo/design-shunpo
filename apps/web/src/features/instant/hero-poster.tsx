import { OrientationPicture } from "@repo/ui/instant/orientation-picture";
import { getImageProps } from "next/image";

import { posters } from "./images";

const ALT =
  "Une semaine d’agenda dessinée à l’encre, chaque heure occupée : cinq colonnes pleines de blocs.";

/* The first frame of the signature, one file per orientation; the visitor downloads only the one shown. */
export function HeroPoster() {
  const {
    props: { srcSet: landscape },
  } = getImageProps({ alt: ALT, sizes: "100vw", src: posters.landscape });
  const { props: portrait } = getImageProps({
    alt: ALT,
    sizes: "100vw",
    src: posters.portrait,
    loading: "eager",
    fetchPriority: "high",
  });
  return <OrientationPicture landscape={landscape ?? ""} portrait={portrait} />;
}
