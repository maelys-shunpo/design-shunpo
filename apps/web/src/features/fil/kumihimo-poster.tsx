import Image from "next/image";

import tangled from "./images/kumihimo-tangled.avif";

/* The capture viewport's width over its height (1440 × 900): Turbopack has reported static AVIF imports as 100 × 100
   in development, which would crop the canvas unlike the poster (shader-craft §2). */
export const posterAspect = 1440 / 900;

/* The first frame of the stand: the LCP, the reduced-motion image and the scene's accessible name. */

export function KumihimoPoster() {
  return (
    <Image
      src={tangled}
      alt="Des dizaines de fils bleus, noirs et un fil rouge emmêlés sur un fond de papier clair"
      fill
      sizes="100vw"
      loading="eager"
      fetchPriority="high"
    />
  );
}
