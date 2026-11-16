"use client";

import { InstantStage } from "@repo/ui/motion/instant-stage";
import { ScrollScene } from "@repo/ui/motion/scroll-scene";
import { useState } from "react";

import { heroChoreography } from "./hero-choreography";
import { HeroCopyBlock } from "./hero-copy-block";
import { HeroPoster } from "./hero-poster";
import { HeroStill } from "./hero-still";

/* The signature: the ink of a saturated week jumps, in three instants, to scattered tools, to one system, then to
   a week mostly free, stamped with the red seal. Held for three screens while the scroll drives it. */
export function HeroScene() {
  const [progress] = useState(() => ({ value: 0 }));
  return (
    <ScrollScene choreography={heroChoreography(progress)} length="long" still={<HeroStill />}>
      <InstantStage
        progress={progress}
        pauseLabel="Mettre l’animation en pause"
        playLabel="Relancer l’animation"
        poster={<HeroPoster />}
      >
        <HeroCopyBlock />
      </InstantStage>
    </ScrollScene>
  );
}
