"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { Scene, WebGLRenderTarget } from "three";

import type { SceneProps } from "../motion/stage.tsx";
import { type Calibre, disposeCalibre } from "./mecanique-calibre.ts";
import { poseCalibre, poseCamera } from "./mecanique-motion.ts";
import { createCalibreOn, createEnvironment, disposeEnvironment } from "./mecanique-resources.ts";
import { StageCanvas } from "./stage-canvas.tsx";
import { useFirstFrame } from "./use-first-frame.ts";
import { useSceneResource } from "./use-scene-resource.ts";
import { useSmoothedPointer } from "./use-smoothed-pointer.ts";

export interface MecaniqueSceneProps extends SceneProps {
  /* A stable { value } object the page's ScrollScene choreography tweens from 0 to 1. */
  progress: { value: number };
}

interface Frame {
  progress: number;
  delta: number;
  time: number;
}

/* Mutations live outside the component: the React Compiler lint rejects writes to hook values in useFrame. */
function advance(calibre: Calibre, scene: Scene, frame: Frame): void {
  Object.assign(scene, { environmentIntensity: 0.55 });
  poseCalibre(calibre, frame);
}

function CalibreFrame({
  calibre,
  environment,
  onReady,
  progress,
}: { calibre: Calibre; environment: WebGLRenderTarget } & Omit<MecaniqueSceneProps, "tier">) {
  const pointer = useSmoothedPointer();
  useFirstFrame(onReady);
  useFrame((state, delta) => {
    advance(calibre, state.scene, {
      progress: progress.value,
      delta,
      time: state.clock.elapsedTime,
    });
    const { width, height } = state.size;
    poseCamera(state.camera, {
      progress: progress.value,
      pointer,
      aspect: width / Math.max(height, 1),
    });
  });
  return (
    <>
      <primitive object={environment.texture} attach="environment" />
      <primitive object={calibre.root} />
      <directionalLight position={[-2.5, -3.5, 5]} intensity={1.7} />
      <pointLight position={[2.6, 1.8, 1.6]} intensity={14} color="#7ab6cc" />
      <pointLight position={[-2.2, 1.2, 2.4]} intensity={2} color="#e5dfd3" />
    </>
  );
}

function CalibreWorld({ tier, onReady, progress }: MecaniqueSceneProps) {
  const renderer = useThree((state) => state.gl);
  const calibre = useSceneResource(createCalibreOn, disposeCalibre, renderer.domElement, tier);
  const environment = useSceneResource(createEnvironment, disposeEnvironment, renderer);
  if (calibre === null || environment === null) {
    return null;
  }
  return (
    <CalibreFrame
      calibre={calibre}
      environment={environment}
      onReady={onReady}
      progress={progress}
    />
  );
}

export function MecaniqueScene(props: MecaniqueSceneProps) {
  return (
    <StageCanvas
      tier={props.tier}
      className="absolute inset-0"
      camera={{ fov: 30, near: 0.1, far: 40, position: [0, -4, 3] }}
    >
      <CalibreWorld {...props} />
    </StageCanvas>
  );
}
