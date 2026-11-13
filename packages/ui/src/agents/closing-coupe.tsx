"use client";

import { type ReactNode, useMemo, useState } from "react";

import { Container } from "../layout/container.tsx";
import { coupeHold } from "../motion/coupe-geometry.ts";
import { CoupeStage } from "../motion/coupe-stage.tsx";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { coupeChoreography } from "./coupe-choreography.ts";

interface ClosingCoupeProps {
  /* The closing shown on the night the coupe uncovers: the title and the one call. */
  children: ReactNode;
}

/* The closing call, reached by a cut. The last questions hold on their paper; the SHUNPO shuriken is thrown across
   the whole page and leaves, a hairline holds for a beat, then the page gives: the two halves fall apart and uncover
   the closing on plain Fuji Night. From tablets up and with motion, the canvas plays the cut over the night and the
   call that wait in the DOM behind it; phones and reduced motion read that night and its call directly, whole. */
export function ClosingCoupe({ children }: ClosingCoupeProps) {
  const [progress] = useState(() => ({ value: 0 }));
  const choreography = useMemo(() => coupeChoreography(progress), [progress]);
  return (
    <div data-slot="closing-coupe">
      <ScrollScene choreography={choreography} length={coupeHold()} below="header" minWidth="md">
        <div className="agents-grain relative min-h-svh w-full bg-background scheme-dark">
          <div className="absolute inset-0 grid place-items-center">
            <Container>{children}</Container>
          </div>
          <div className="absolute inset-0 hidden md:motion-safe:block">
            <CoupeStage
              poster={<div aria-hidden className="size-full agents-plie scheme-light" />}
              progress={progress}
            />
          </div>
        </div>
      </ScrollScene>
    </div>
  );
}
