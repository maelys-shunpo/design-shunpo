import { lazy } from "react";

import type { SceneProps } from "../../src/motion/stage.tsx";
import { StageCanvas } from "../../src/scene/stage-canvas.tsx";
import { useFirstFrame } from "../../src/scene/use-first-frame.ts";

/* A flat plate standing for the box, for a poster: it carries the stage's accessible name. */
const PLATE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23dcd5c7'/%3E%3C/svg%3E";

export function plainPoster(name: string) {
  return <img alt={name} src={PLATE} className="block w-full" />;
}

/* Turned a little so the box reads as a volume. */
const TURN: [number, number, number] = [0.5, 0.6, 0];

function Box({ onReady }: Pick<SceneProps, "onReady">) {
  useFirstFrame(onReady);

  return (
    <mesh rotation={TURN}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  );
}

/* A neutral box: ready once its first frame is drawn, its tier readable on the canvas. */
function PlainScene({ tier, onReady }: SceneProps) {
  return (
    <StageCanvas tier={tier} data-tier={tier}>
      <Box onReady={onReady} />
    </StageCanvas>
  );
}

/* Lazy like a real scene, so the stage's Suspense boundary is exercised; a real effect imports its scene module there. */
const LazyPlainScene = lazy(() => Promise.resolve({ default: PlainScene }));

export function plainScene(scene: SceneProps) {
  return <LazyPlainScene {...scene} />;
}
