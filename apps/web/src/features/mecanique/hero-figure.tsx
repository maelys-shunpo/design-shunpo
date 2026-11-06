import { Stack } from "@repo/ui/layout/stack";
import { DimensionLine } from "@repo/ui/mecanique/dimension-line";
import { MecaniqueStage } from "@repo/ui/motion/mecanique-stage";
import Image from "next/image";

import poster from "./images/calibre-poster.webp";

interface HeroFigureProps {
  progress: { value: number };
}

/* The calibre and its caption, drawn like figure 1 of a technical sheet. */
export function HeroFigure({ progress }: HeroFigureProps) {
  return (
    <Stack gap="md" align="center">
      <MecaniqueStage
        progress={progress}
        poster={
          <Image
            src={poster}
            alt="Un mouvement de montre en vue éclatée : platine, rouage, balancier et ponts suspendus au-dessus de leur place."
            sizes="(min-width: 64rem) 45vw, 90vw"
            loading="eager"
            fetchPriority="high"
          />
        }
      />
      <DimensionLine label="Fig. 1 · Calibre SHUNPO" />
    </Stack>
  );
}
