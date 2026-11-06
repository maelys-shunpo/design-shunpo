"use client";

import { FilBeats } from "@repo/ui/fil/fil-beats";
import { FilHeroFrame } from "@repo/ui/fil/fil-hero-frame";
import { KumihimoStage } from "@repo/ui/motion/fil-kumihimo-stage";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { useState } from "react";

import { beats } from "./beats";
import { HeroCopy } from "./hero-copy";
import { braidChoreography } from "./kumihimo-choreography";
import { KumihimoPoster, posterAspect } from "./kumihimo-poster";
import { KumihimoStills } from "./kumihimo-stills";

export function KumihimoHero() {
  const [progress] = useState(() => ({ value: 0 }));
  const [choreography] = useState(() => braidChoreography(progress));
  return (
    <ScrollScene choreography={choreography} length="long" still={<KumihimoStills />}>
      <KumihimoStage
        progress={progress}
        posterAspect={posterAspect}
        pauseLabel="Mettre en pause les fils"
        playLabel="Relancer les fils"
        poster={<KumihimoPoster />}
      >
        <FilHeroFrame foot={<FilBeats beats={beats} label="Les trois temps du tressage" />}>
          <HeroCopy />
        </FilHeroFrame>
      </KumihimoStage>
    </ScrollScene>
  );
}
