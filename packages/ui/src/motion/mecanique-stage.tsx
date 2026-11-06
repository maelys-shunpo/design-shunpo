"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { lazy, type ReactElement } from "react";

import { cn } from "../lib/cn.ts";
import { Stage } from "./stage.tsx";

/* One import for the stage to prepare and the lazy scene to render. */
function loadMecaniqueScene() {
  return import("../scene/mecanique-scene.tsx");
}

const LazyMecaniqueScene = lazy(async () => {
  const { MecaniqueScene } = await loadMecaniqueScene();
  return { default: MecaniqueScene };
});

/* The calibre lives in a square: poster and canvas share one box and one aspect, so the crossfade never jumps. */
const stageVariants = cva("aspect-square w-full [&_img]:size-full [&_img]:object-contain", {
  variants: {
    size: {
      md: "max-w-prose",
      lg: "",
    },
  },
  defaultVariants: { size: "lg" },
});

interface MecaniqueStageProps extends VariantProps<typeof stageVariants> {
  /* A next/image of the scene's first frame, the exploded calibre: the reduced-motion page and the accessible name. */
  poster: ReactElement;
  /* A stable { value } object the page's ScrollScene choreography tweens from 0 to 1. */
  progress: { value: number };
  pauseLabel?: string;
  playLabel?: string;
  className?: string;
}

/* The signature of the Mécanique direction: a watch movement drawn in code, exploded, assembled part by part,
   set running, then closed by its dial as the page scrolls. The parts float while exploded, so it is ambient. */
export function MecaniqueStage({
  poster,
  progress,
  size,
  pauseLabel = "Mettre l’animation en pause",
  playLabel = "Relancer l’animation",
  className,
}: MecaniqueStageProps) {
  return (
    <Stage
      ambient
      className={cn(stageVariants({ size }), className)}
      poster={poster}
      prepareScene={loadMecaniqueScene}
      pauseLabel={pauseLabel}
      playLabel={playLabel}
      renderScene={(scene) => <LazyMecaniqueScene {...scene} progress={progress} />}
    />
  );
}
