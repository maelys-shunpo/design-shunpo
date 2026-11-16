"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";

import {
  createCrumpleSheet,
  startCrumpleInteraction,
} from "../motion/paper-crumple-interaction.ts";
import type { SceneProps } from "../motion/stage.tsx";
import { posePaperCrumple } from "./paper-crumple-pose.ts";
import type { PaperCrumpleWorld } from "./paper-crumple-world.ts";
import { StageCanvas } from "./stage-canvas.tsx";
import { useFirstFrame } from "./use-first-frame.ts";
import { usePaperCrumpleWorld } from "./use-paper-crumple-world.ts";

export type { PaperSheet } from "./paper-crumple-pose.ts";

export interface PaperCrumpleSceneProps extends SceneProps {
  /* Stable callbacks: the message fades out while crumpling and in once settled; onArrived fires when the unfold ends. */
  onCrumplingChange?: ((crumpling: boolean) => void) | undefined;
  onArrived?: (() => void) | undefined;
}

/* The camera frames eight world units of height, whatever the aspect: fov 30 at this distance (as the coupe does). */
const CAMERA_DISTANCE = 4 / Math.tan((15 * Math.PI) / 180);
const FRAME_HEIGHT = 8;

function PaperCrumpleFrame({
  world,
  onReady,
  onCrumplingChange,
  onArrived,
}: { world: PaperCrumpleWorld } & Omit<PaperCrumpleSceneProps, "tier">) {
  const size = useThree((state) => state.size);
  const canvas = useThree((state) => state.gl.domElement);
  const handle = useMemo(() => createCrumpleSheet(), []);
  useEffect(
    () => startCrumpleInteraction(handle, { canvas, onCrumplingChange, onArrived }),
    [handle, canvas, onCrumplingChange, onArrived],
  );
  useFirstFrame(onReady);
  useFrame(() => {
    const aspect = size.width / size.height;
    const width = FRAME_HEIGHT * aspect;
    /* Fill the canvas box with the plane, folds scaled by the sheet's size. */
    world.mesh.scale.set(width, FRAME_HEIGHT, (width + FRAME_HEIGHT) / 2);
    posePaperCrumple(world, handle.sheet);
  });
  return <primitive object={world.root} />;
}

function PaperCrumple({ tier, onReady, onCrumplingChange, onArrived }: PaperCrumpleSceneProps) {
  const world = usePaperCrumpleWorld(tier);
  if (world === null) {
    return null;
  }
  return (
    <PaperCrumpleFrame
      world={world}
      onReady={onReady}
      onCrumplingChange={onCrumplingChange}
      onArrived={onArrived}
    />
  );
}

/* The 404 sheet in three.js: a subdivided plane folded in the vertex shader, lit as an Agents paper. The canvas is
   transparent and never takes the pointer, so the HTML copy and the home call over it stay readable and clickable;
   every pointer move is read on the window, not here. */
export function PaperCrumpleScene(props: PaperCrumpleSceneProps) {
  return (
    <StageCanvas
      tier={props.tier}
      className="absolute inset-0"
      style={{ pointerEvents: "none" }}
      shadows={props.tier === "full" ? "percentage" : false}
      camera={{ fov: 30, near: 0.1, far: 40, position: [0, 0, CAMERA_DISTANCE] }}
    >
      <PaperCrumple {...props} />
    </StageCanvas>
  );
}
