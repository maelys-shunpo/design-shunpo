"use client";

import { useFrame, useThree } from "@react-three/fiber";

import type { SceneProps } from "../motion/stage.tsx";
import { poseCoupe } from "./coupe-pose.ts";
import type { CoupeWorld } from "./coupe-world.ts";
import { StageCanvas } from "./stage-canvas.tsx";
import { useCoupeWorld } from "./use-coupe-world.ts";
import { useFirstFrame } from "./use-first-frame.ts";

export interface CoupeSceneProps extends SceneProps {
  /* A stable { value } object the page's scroll choreography tweens from 0 to 1. */
  progress: { value: number };
}

/* The camera frames eight world units of height, whatever the aspect: fov 30 at this distance. */
const CAMERA_DISTANCE = 4 / Math.tan((15 * Math.PI) / 180);

function CoupeFrame({
  world,
  onReady,
  progress,
}: { world: CoupeWorld } & Omit<CoupeSceneProps, "tier">) {
  const size = useThree((state) => state.size);
  useFirstFrame(onReady);
  useFrame((state) => {
    poseCoupe(world, state.camera, {
      aspect: size.width / size.height,
      progress: progress.value,
    });
  });
  return <primitive object={world.root} />;
}

function Coupe({ tier, onReady, progress }: CoupeSceneProps) {
  const world = useCoupeWorld(tier);
  if (world === null) {
    return null;
  }
  return <CoupeFrame world={world} onReady={onReady} progress={progress} />;
}

/* The page as one sheet, thrown through by the SHUNPO shuriken and torn apart along the cut. The canvas is
   transparent: the night and the closing wait in the DOM behind it, uncovered as the two halves fall away. The
   scroll drives it, so its poster cuts to it rather than fading over a scene already moved on. */
export function CoupeScene(props: CoupeSceneProps) {
  return (
    <StageCanvas
      tier={props.tier}
      className="absolute inset-0"
      /* R3F's canvas container sets `pointer-events: auto`, which would re-capture the pointer over the call that waits
         in the DOM behind this transparent canvas; turn it off so the revealed button stays clickable (every pointer
         scene listens on the window, never the canvas, so nothing on the canvas needs events). */
      style={{ pointerEvents: "none" }}
      camera={{ fov: 30, near: 0.1, far: 40, position: [0, 0, CAMERA_DISTANCE] }}
    >
      <Coupe {...props} />
    </StageCanvas>
  );
}
