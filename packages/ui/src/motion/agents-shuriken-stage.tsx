"use client";

import { lazy, type ReactElement } from "react";

import type { ShurikenMark } from "../scene/agents-shuriken-world.ts";
import { Stage } from "./stage.tsx";

/* One import for the stage to prepare and the lazy scene to render. */
function loadShurikenScene() {
  return import("../scene/agents-shuriken-scene.tsx");
}

const LazyShurikenScene = lazy(async () => {
  const { AgentsShurikenScene } = await loadShurikenScene();
  return { default: AgentsShurikenScene };
});

interface AgentsShurikenStageProps {
  /* A next/image of the scene's first frame, the four sheets laid on the paper: the accessible name. */
  poster: ReactElement;
  /* A stable { value } object the page's scroll choreography tweens from 0 to 1. */
  progress: { value: number };
  /* The four tools printed on the sheets, from the top point of the sign clockwise. */
  marks: readonly ShurikenMark[];
  pauseLabel?: string;
  playLabel?: string;
}

/* The signature of the « Agents » hero: four sheets, one per tool, fold into points and lock into the SHUNPO sign
   on its Fushimi pebble. Paper breathes, so it is ambient. A square stage: its poster covers it exactly. The scroll
   drives it, so it may go live mid-scroll: the poster cuts to it rather than fading over a scene moved on. */
export function AgentsShurikenStage({
  poster,
  progress,
  marks,
  pauseLabel = "Mettre l’animation en pause",
  playLabel = "Relancer l’animation",
}: AgentsShurikenStageProps) {
  return (
    <Stage
      ambient
      posterExit="cut"
      className="aspect-square w-full [&_img]:size-full [&_img]:object-cover"
      poster={poster}
      prepareScene={loadShurikenScene}
      pauseLabel={pauseLabel}
      playLabel={playLabel}
      renderScene={(scene) => <LazyShurikenScene {...scene} progress={progress} marks={marks} />}
    />
  );
}
