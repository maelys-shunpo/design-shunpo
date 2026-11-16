"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping, type WebGLRenderer, type WebGLRenderTarget } from "three";

import type { SceneProps } from "../motion/stage.tsx";
import { poseStudio } from "./origami-motion.ts";
import { createStudio, createWorldOn, disposeStudio } from "./origami-resources.ts";
import { disposeWorld, type OrigamiWorld } from "./origami-world.ts";
import { StageCanvas } from "./stage-canvas.tsx";
import { useFirstFrame } from "./use-first-frame.ts";
import { useSceneResource } from "./use-scene-resource.ts";
import { useSmoothedPointer } from "./use-smoothed-pointer.ts";

export interface OrigamiSceneProps extends SceneProps {
  /* A stable { value } object the page's scroll choreography tweens from 0 to 1. */
  progress: { value: number };
}

/* The world is posed from module functions: the React Compiler lint rejects writes to hook values in useFrame. */
function StudioFrame({
  world,
  studio,
  onReady,
  progress,
}: { world: OrigamiWorld; studio: WebGLRenderTarget } & Omit<OrigamiSceneProps, "tier">) {
  const pointer = useSmoothedPointer();
  useFirstFrame(onReady);
  useFrame((state, delta) => {
    Object.assign(state.scene, { environmentIntensity: 0.25 });
    const { width, height } = state.size;
    poseStudio(world, state.camera, {
      delta,
      progress: progress.value,
      pointer,
      aspect: width / Math.max(height, 1),
    });
  });
  return (
    <>
      <primitive object={studio.texture} attach="environment" />
      <primitive object={world.root} />
    </>
  );
}

function Studio({ tier, onReady, progress }: OrigamiSceneProps) {
  const renderer = useThree((state) => state.gl);
  const world = useSceneResource(createWorldOn, disposeWorld, renderer.domElement, tier);
  const studio = useSceneResource(createStudio, disposeStudio, renderer);
  if (world === null || studio === null) {
    return null;
  }
  return <StudioFrame world={world} studio={studio} onReady={onReady} progress={progress} />;
}

/* ACES filmic at its neutral exposure: white paper stays white on the bright studio, orange and cobalt stay
   saturated. */
function exposeStudio({ gl }: { gl: WebGLRenderer }): void {
  Object.assign(gl, { toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1 });
}

export function OrigamiScene(props: OrigamiSceneProps) {
  return (
    <StageCanvas
      tier={props.tier}
      className="absolute inset-0"
      shadows={props.tier === "full" ? "percentage" : false}
      onCreated={exposeStudio}
      camera={{ fov: 34, near: 0.1, far: 80, position: [0.5, 5.6, 2.2] }}
    >
      <Studio {...props} />
    </StageCanvas>
  );
}
