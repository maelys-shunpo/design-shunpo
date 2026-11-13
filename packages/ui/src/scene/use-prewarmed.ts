import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { Object3D, Texture } from "three";

import { useRethrow } from "./use-rethrow.ts";

interface Warmable {
  /* The scene's content, compiled for the canvas's scene and camera before it is drawn. */
  root: Object3D;
  /* Textures uploaded to the GPU ahead of the first frame (prints drawn on canvases, grain). */
  textures: readonly Texture[];
  /* The environment the materials will light from, so their programs compile with it. */
  environment: Texture;
}

/* A scene's world is made after the canvas, so the canvas's own compile, before its first frame, never sees it:
   its programs would compile, and its textures upload, inside that frame, a long task while the visitor scrolls.
   This compiles them in parallel where the GPU allows (KHR_parallel_shader_compile) and uploads the textures,
   then reports the world ready. A failure reaches the stage, which brings the poster back. */
type EffectCleanup = (() => void) | undefined;

export function usePrewarmed(warmable: Warmable | null): boolean {
  const get = useThree((state) => state.get);
  const rethrow = useRethrow();
  const [warmed, setWarmed] = useState<Warmable | null>(null);
  useEffect((): EffectCleanup => {
    if (warmable === null) {
      return undefined;
    }
    let current = true;
    const { gl, scene, camera } = get();
    Object.assign(scene, { environment: warmable.environment });
    async function warm(target: Warmable): Promise<void> {
      scene.add(target.root);
      try {
        await gl.compileAsync(scene, camera);
        for (const texture of target.textures) {
          gl.initTexture(texture);
        }
      } catch (error) {
        if (current) {
          rethrow(error);
        }
        return;
      } finally {
        scene.remove(target.root);
      }
      if (current) {
        setWarmed(target);
      }
    }
    void warm(warmable);
    return () => {
      current = false;
    };
  }, [get, rethrow, warmable]);
  return warmable !== null && warmed === warmable;
}
