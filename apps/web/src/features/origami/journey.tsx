"use client";

import { OrigamiJourney } from "@repo/ui/motion/origami-journey";
import { OrigamiStage } from "@repo/ui/motion/origami-stage";
import Image from "next/image";
import { useState } from "react";

import poster from "./images/studio-poster.webp";
import { JourneyChapters } from "./journey-chapters";
import { journeyChoreography } from "./journey-choreography";

/* The signature: the studio held in the window while the chapters scroll over it. */
export function Journey() {
  const [progress] = useState(() => ({ value: 0 }));
  return (
    <OrigamiJourney
      choreography={journeyChoreography(progress)}
      stage={
        <OrigamiStage
          progress={progress}
          poster={
            <Image
              src={poster}
              alt="Une feuille de papier ivoire posée à plat dans un studio sombre, vue d’en haut, avant le premier pli."
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
            />
          }
        />
      }
    >
      <JourneyChapters />
    </OrigamiJourney>
  );
}
