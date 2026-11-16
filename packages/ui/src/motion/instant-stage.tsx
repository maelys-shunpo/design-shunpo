"use client";

import { lazy, type ReactElement, type ReactNode } from "react";

import { Stage } from "./stage.tsx";

/* One import for the stage to prepare and the lazy scene to render. */
function loadInstantScene() {
  return import("../scene/instant-scene.tsx");
}

const LazyInstantScene = lazy(async () => {
  const { InstantScene } = await loadInstantScene();
  return { default: InstantScene };
});

interface InstantStageProps {
  /* The scene's first frame, art-directed by orientation (OrientationPicture): the scene lays its drawing out by
     orientation, so the poster shown always matches the canvas it hands over to. */
  poster: ReactElement;
  /* A stable { value } object the page's ScrollScene choreography tweens from 0 to 1. */
  progress: { value: number };
  pauseLabel: string;
  playLabel: string;
  /* Copy laid over the paper, beside the drawing in landscape and under it in portrait. Only its links and
     buttons take the pointer, so the ink still parts under the mouse and the pause control stays reachable. */
  children?: ReactNode;
}

export function InstantStage({
  poster,
  progress,
  pauseLabel,
  playLabel,
  children,
}: InstantStageProps) {
  return (
    <div data-slot="instant-stage" className="grid h-svh w-full">
      <Stage
        ambient
        pauseLabel={pauseLabel}
        playLabel={playLabel}
        className="col-start-1 row-start-1 h-svh w-full"
        poster={poster}
        prepareScene={loadInstantScene}
        renderScene={(scene) => <LazyInstantScene {...scene} progress={progress} />}
      />
      {children === undefined ? null : (
        <div className="pointer-events-none relative col-start-1 row-start-1 grid size-full [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          {children}
        </div>
      )}
    </div>
  );
}
