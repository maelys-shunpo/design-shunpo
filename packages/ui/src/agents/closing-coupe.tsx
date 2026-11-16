"use client";

import { type ReactNode, useMemo, useState } from "react";

import { sceneHold } from "../motion/coupe-geometry.ts";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { coupeChoreography } from "./coupe-choreography.ts";
import { CoupeScene } from "./coupe-scene.tsx";

interface ClosingCoupeProps {
  /* The FAQ read before the cut: the live, interactive list the gesture then cuts to uncover the closing. */
  faq: ReactNode;
  /* The closing the coupe uncovers: the title and the one call. */
  children: ReactNode;
}

/* The closing call, reached by a cut played on the real FAQ. The questions are read whole on their paper; after a
   reading dwell the SHUNPO shuriken crosses the page and leaves, a hairline holds for a beat, then the page gives: the
   two paper halves fall apart and uncover the closing on plain Fuji Night. From tablets up and with motion the scene
   is pinned under the header and the DOM coupe plays over the closing waiting behind it; phones and reduced motion read
   the FAQ and then that closing directly, whole, with no gesture. */
export function ClosingCoupe({ faq, children }: ClosingCoupeProps) {
  const [progress] = useState(() => ({ value: 0 }));
  const choreography = useMemo(() => coupeChoreography(progress), [progress]);
  return (
    /* The night is the scene's own ground, so the scene reads as one block of Fuji Night: where it is not pinned the
       stage's own rhythm no longer shows the page's cream paper as a band above the footer. */
    <div data-slot="closing-coupe" className="bg-background scheme-dark">
      <ScrollScene choreography={choreography} length={sceneHold()} below="header" minWidth="md">
        <CoupeScene faq={faq} progress={progress}>
          {children}
        </CoupeScene>
      </ScrollScene>
    </div>
  );
}
