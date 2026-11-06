"use client";

import { useFrame, useThree } from "@react-three/fiber";

import { resolveColor } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import type { SceneProps } from "../motion/stage.tsx";
import { useInkPointer } from "./instant-pointer.ts";
import { advance, createInk, disposeInk, type Ink } from "./instant-points.ts";
import { StageCanvas } from "./stage-canvas.tsx";
import { useFirstFrame } from "./use-first-frame.ts";
import { useSceneResource } from "./use-scene-resource.ts";

export interface InstantSceneProps extends SceneProps {
  /* Tweened from 0 to 1 by the page's ScrollScene choreography: four drawings, three jumps. */
  progress: { value: number };
}

/* The ink and the seal take the page's tokens, read on the canvas itself. */
function createFromCanvas(canvas: HTMLCanvasElement, tier: QualityTier, pixelRatio: number): Ink {
  return createInk(tier, pixelRatio, {
    ink: resolveColor(canvas, "--brand-fuji"),
    seal: resolveColor(canvas, "--brand-fushimi"),
  });
}

/* Rendered once the ink exists, so the first frame it reports is a drawn one. */
function InkFrame({
  ink,
  onReady,
  progress,
}: { ink: Ink } & Pick<InstantSceneProps, "onReady" | "progress">) {
  useInkPointer(ink.uniforms);
  useFirstFrame(onReady);
  useFrame((state, delta) => {
    advance(ink.uniforms, {
      delta,
      progress: progress.value,
      width: state.size.width,
      height: state.size.height,
    });
  });
  return (
    <>
      {ink.materials.map((material, order) => (
        <points
          key={material.uuid}
          geometry={ink.geometry}
          material={material}
          frustumCulled={false}
          renderOrder={order}
        />
      ))}
    </>
  );
}

function InkLayers({ tier, onReady, progress }: InstantSceneProps) {
  const canvas = useThree((state) => state.gl.domElement);
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const ink = useSceneResource(createFromCanvas, disposeInk, canvas, tier, pixelRatio);
  return ink === null ? null : <InkFrame ink={ink} onReady={onReady} progress={progress} />;
}

export function InstantScene(props: InstantSceneProps) {
  return (
    <StageCanvas tier={props.tier} flat className="absolute inset-0">
      <InkLayers {...props} />
    </StageCanvas>
  );
}
