"use client";

import { lazy, type ReactElement, type ReactNode } from "react";

import { Stage } from "./stage.tsx";

/* One import for the stage to prepare and the lazy scene to render. */
function loadKumihimoScene() {
  return import("../scene/fil-kumihimo-scene.tsx");
}

const LazyKumihimoScene = lazy(async () => {
  const { KumihimoScene } = await loadKumihimoScene();
  return { default: KumihimoScene };
});

interface KumihimoStageProps {
  /* A next/image of the scene's first frame (the tangled threads): the reduced-motion page and the accessible name. */
  poster: ReactElement;
  /* A stable { value } object the page's ScrollScene choreography tweens from 0 to 1. */
  progress: { value: number };
  /* The poster's width over height, from its static import. */
  posterAspect: number;
  /* Names of the pause control, in the page's language. */
  pauseLabel: string;
  playLabel: string;
  /* Copy laid over the threads, on a veil of the ground that keeps it readable over any frame. */
  children?: ReactNode;
}

/* Veils marked data-fil-veil may be lifted by the page's choreography once the copy has left the stage.
   The kumihimo stand of the « Le fil » direction: threads tangled, combed, then braided into one cord as the
   page's progress runs, filling the window behind its copy. The copy layer lets the pointer through, except on
   its links and buttons, so the threads part under the mouse and the pause control stays reachable. */
export function KumihimoStage({
  poster,
  progress,
  posterAspect,
  pauseLabel,
  playLabel,
  children,
}: KumihimoStageProps) {
  return (
    <div data-slot="kumihimo-stage" className="grid w-full">
      <Stage
        ambient
        pauseLabel={pauseLabel}
        playLabel={playLabel}
        className="col-start-1 row-start-1 h-svh w-full [&_img]:size-full [&_img]:object-cover"
        poster={poster}
        prepareScene={loadKumihimoScene}
        renderScene={(scene) => (
          <LazyKumihimoScene {...scene} progress={progress} posterAspect={posterAspect} />
        )}
      />
      <div
        aria-hidden
        data-fil-veil
        className="pointer-events-none relative col-start-1 row-start-1 hidden bg-linear-to-r from-background from-25% via-background/70 via-45% to-transparent to-70% md:block"
      />
      <div
        aria-hidden
        data-fil-veil
        className="pointer-events-none relative col-start-1 row-start-1 bg-linear-to-t from-background from-30% via-background/85 via-55% to-transparent to-85% md:from-10% md:via-20% md:to-35%"
      />
      <div
        aria-hidden
        className="pointer-events-none relative col-start-1 row-start-1 bg-linear-to-b from-background to-transparent to-20%"
      />
      <div className="pointer-events-none relative col-start-1 row-start-1 h-svh w-full [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
