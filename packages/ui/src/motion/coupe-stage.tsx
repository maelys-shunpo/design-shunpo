"use client";

import { lazy, type ReactElement } from "react";

import { Stage } from "./stage.tsx";

/* One import for the stage to prepare and the lazy scene to render. */
function loadCoupeScene() {
  return import("../scene/coupe-scene.tsx");
}

const LazyCoupeScene = lazy(async () => {
  const { CoupeScene } = await loadCoupeScene();
  return { default: CoupeScene };
});

interface CoupeStageProps {
  /* The page still whole as paper, shown before the scene runs and wherever it cannot: the sheet about to be cut. */
  poster: ReactElement;
  /* A stable { value } object the page's scroll choreography tweens from 0 to 1. */
  progress: { value: number };
}

/* The coupe's canvas over the closing it uncovers: the sheet, the thrown shuriken and the two halves falling away.
   It never takes the pointer, so the call behind it stays clickable once the halves have gone. The scroll drives it,
   so the poster cuts to it rather than fading over a scene already moved on. */
export function CoupeStage({ poster, progress }: CoupeStageProps) {
  return (
    <Stage
      posterExit="cut"
      className="pointer-events-none absolute inset-0"
      poster={poster}
      prepareScene={loadCoupeScene}
      renderScene={(scene) => <LazyCoupeScene {...scene} progress={progress} />}
    />
  );
}
