"use client";

import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { Vector2 } from "three";

import { resolveColor } from "../lib/css-color.ts";
import type { SceneProps } from "../motion/stage.tsx";
import {
  createKumihimo,
  disposeKumihimo,
  type Kumihimo,
  type KumihimoColours,
  toLinear,
  weave,
} from "./fil-kumihimo-shaders.ts";
import { StageCanvas } from "./stage-canvas.tsx";
import { useFirstFrame } from "./use-first-frame.ts";
import { useSceneResource } from "./use-scene-resource.ts";
import { useSmoothedPointer } from "./use-smoothed-pointer.ts";

interface KumihimoSceneProps extends SceneProps {
  progress: { value: number };
  /* The poster's width over height: coverUv frames the canvas like the poster in any box. */
  posterAspect: number;
}

/* How fast a sweep of the mouse plucks the threads, and how fast they settle back (per second). */
const PULL_GAIN = 2.2;
const PULL_RELEASE = 2.4;

interface Frame {
  delta: number;
  progress: number;
}

/* Mutations live outside the component: the React Compiler lint rejects writing to hook values in useFrame.
   Each frame lays the threads on the CPU for the size the canvas has just been measured at.
   The pull follows the speed of the pointer, so the threads part when a hand sweeps them and close when it rests. */
export function advanceKumihimo(kumihimo: Kumihimo, previous: Vector2, frame: Frame): void {
  const { uTime, uProgress, uPull, uPointer } = kumihimo.uniforms;
  uTime.value += frame.delta;
  uProgress.value = frame.progress;
  const step = Math.max(frame.delta, 1e-4);
  const speed = uPointer.value.distanceTo(previous) / step;
  const target = Math.min(speed * PULL_GAIN * 0.1, 1);
  const settle = Math.min(1, step * PULL_RELEASE);
  uPull.value = Math.max(target, uPull.value + (0 - uPull.value) * settle);
  previous.copy(uPointer.value);
  weave(kumihimo);
}

function toUnit([red, green, blue]: [number, number, number]): number[] {
  return [toLinear(red / 255), toLinear(green / 255), toLinear(blue / 255)];
}

/* The brand tokens on the host: a direction or a scheme island recolours the threads like the page. */
export function readColours(host: Element, colours: KumihimoColours): void {
  const tokens = [
    "--brand-tenku",
    "--brand-fuji",
    "--brand-tenku-ink",
    "--brand-tenku-light",
    "--brand-frost",
  ] as const;
  colours.ground.fromArray(toUnit(resolveColor(host, "--background")));
  colours.red.fromArray(toUnit(resolveColor(host, "--brand-fushimi")));
  tokens.forEach((token, index) => {
    colours.inks[index]?.fromArray(toUnit(resolveColor(host, token)));
  });
}

function KumihimoFrame({
  kumihimo,
  onReady,
  progress,
}: { kumihimo: Kumihimo } & Pick<KumihimoSceneProps, "onReady" | "progress">) {
  const [previous] = useState(() => new Vector2());
  useFirstFrame(onReady);
  useFrame((state, delta) => {
    state.gl.getDrawingBufferSize(kumihimo.uniforms.uResolution.value);
    advanceKumihimo(kumihimo, previous, { delta, progress: progress.value });
  });
  return (
    <mesh frustumCulled={false} material={kumihimo.material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function createTinted(
  pointer: Vector2,
  scene: Pick<KumihimoSceneProps, "tier" | "posterAspect">,
  host: Element,
) {
  const kumihimo = createKumihimo(pointer, scene.tier, scene.posterAspect);
  readColours(host, {
    ground: kumihimo.uniforms.uGround.value,
    inks: kumihimo.uniforms.uInks.value,
    red: kumihimo.uniforms.uRed.value,
  });
  return kumihimo;
}

function KumihimoPlane({
  tier,
  onReady,
  progress,
  posterAspect,
  host,
}: KumihimoSceneProps & { host: Element }) {
  const pointer = useSmoothedPointer();
  const [scene] = useState(() => ({ tier, posterAspect }));
  const kumihimo = useSceneResource(createTinted, disposeKumihimo, pointer, scene, host);
  return kumihimo === null ? null : (
    <KumihimoFrame kumihimo={kumihimo} onReady={onReady} progress={progress} />
  );
}

export function KumihimoScene(props: KumihimoSceneProps) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setHost} data-slot="kumihimo-scene" className="absolute inset-0">
      {host === null ? null : (
        <StageCanvas tier={props.tier} flat className="absolute inset-0">
          <KumihimoPlane {...props} host={host} />
        </StageCanvas>
      )}
    </div>
  );
}
