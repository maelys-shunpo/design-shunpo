"use client";

import { lazy, type ReactElement } from "react";

import { Stage } from "./stage.tsx";

/* One import for the stage to prepare and the lazy scene to render. */
function loadOrigamiScene() {
  return import("../scene/origami-scene.tsx");
}

const LazyOrigamiScene = lazy(async () => {
  const { OrigamiScene } = await loadOrigamiScene();
  return { default: OrigamiScene };
});

interface OrigamiStageProps {
  /* A next/image of the scene's first frame, the flat sheet seen from above: the reduced-motion page and the
     accessible name. */
  poster: ReactElement;
  /* A stable { value } object the page's scroll choreography tweens from 0 to 1. */
  progress: { value: number };
  pauseLabel?: string;
  playLabel?: string;
}

/* The signature of the Origami direction: a studio where a sheet folds into a plane that takes off, and the
   camera travels to a crane, a box and a boat that fold as it arrives. The paper floats, so it is ambient.
   It fills the window; its poster covers it like the canvas. */
export function OrigamiStage({
  poster,
  progress,
  pauseLabel = "Mettre l’animation en pause",
  playLabel = "Relancer l’animation",
}: OrigamiStageProps) {
  return (
    <Stage
      ambient
      className="h-svh w-full [&_img]:size-full [&_img]:object-cover"
      poster={poster}
      prepareScene={loadOrigamiScene}
      pauseLabel={pauseLabel}
      playLabel={playLabel}
      renderScene={(scene) => <LazyOrigamiScene {...scene} progress={progress} />}
    />
  );
}
