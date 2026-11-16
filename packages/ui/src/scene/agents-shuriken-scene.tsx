"use client";

import { useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping, type WebGLRenderer, type WebGLRenderTarget } from "three";

import type { SceneProps } from "../motion/stage.tsx";
import { poseShuriken } from "./agents-shuriken-pose.ts";
import type { ShurikenMark, ShurikenWorld } from "./agents-shuriken-world.ts";
import { StageCanvas } from "./stage-canvas.tsx";
import { useFirstFrame } from "./use-first-frame.ts";
import { useShurikenWorld } from "./use-shuriken-world.ts";
import { useSmoothedPointer } from "./use-smoothed-pointer.ts";

export interface AgentsShurikenSceneProps extends SceneProps {
  /* A stable { value } object the page's scroll choreography tweens from 0 to 1. */
  progress: { value: number };
  /* The four tools printed on the sheets, in the order the points take round the sign from the top. */
  marks: readonly ShurikenMark[];
}

/* The world is posed from module functions: the React Compiler lint rejects writes to hook values in useFrame. */
function SignFrame({
  world,
  studio,
  onReady,
  progress,
}: { world: ShurikenWorld; studio: WebGLRenderTarget } & Omit<
  AgentsShurikenSceneProps,
  "tier" | "marks"
>) {
  const pointer = useSmoothedPointer();
  useFirstFrame(onReady);
  useFrame((state, delta) => {
    Object.assign(state.scene, { environmentIntensity: 0.3 });
    poseShuriken(world, state.camera, {
      delta,
      progress: progress.value,
      pointer,
    });
  });
  return (
    <>
      <primitive object={studio.texture} attach="environment" />
      <primitive object={world.root} />
    </>
  );
}

function Sign({ tier, onReady, progress, marks }: AgentsShurikenSceneProps) {
  const ready = useShurikenWorld(tier, marks);
  if (ready === null) {
    return null;
  }
  return (
    <SignFrame world={ready.world} studio={ready.studio} onReady={onReady} progress={progress} />
  );
}

/* ACES filmic at its neutral exposure: the light papers stay light on the Kome page, the Fushimi stays deep. */
function expose({ gl }: { gl: WebGLRenderer }): void {
  Object.assign(gl, { toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 });
}

/* Four sheets, one per tool, fold into points and lock into the SHUNPO sign on its pebble. The canvas is
   transparent: the page's paper is the floor, under the contact shadows. */
export function AgentsShurikenScene(props: AgentsShurikenSceneProps) {
  return (
    <StageCanvas
      tier={props.tier}
      className="absolute inset-0"
      shadows={props.tier === "full" ? "percentage" : false}
      onCreated={expose}
      camera={{ fov: 32, near: 0.1, far: 40, position: [0.7, 4.5, 4.9] }}
    >
      <Sign {...props} />
    </StageCanvas>
  );
}
