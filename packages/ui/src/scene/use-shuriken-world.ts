import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import type { WebGLRenderTarget } from "three";

import type { QualityTier } from "../lib/quality-tier.ts";
import {
  createShurikenWorldOn,
  disposeShurikenWorld,
  type ShurikenMark,
  type ShurikenWorld,
} from "./agents-shuriken-world.ts";
import { createStudio, disposeStudio } from "./origami-resources.ts";
import { usePrewarmed } from "./use-prewarmed.ts";
import { useSceneResource } from "./use-scene-resource.ts";

/* The sign's world and its light box, made in effects and prewarmed: null until both are compiled and uploaded. */
export function useShurikenWorld(
  tier: QualityTier,
  marks: readonly ShurikenMark[],
): { world: ShurikenWorld; studio: WebGLRenderTarget } | null {
  const renderer = useThree((state) => state.gl);
  const world = useSceneResource(
    createShurikenWorldOn,
    disposeShurikenWorld,
    renderer.domElement,
    tier,
    marks,
  );
  const studio = useSceneResource(createStudio, disposeStudio, renderer);
  const warmable = useMemo(
    () =>
      world === null || studio === null
        ? null
        : {
            root: world.root,
            textures: [...world.papers.marks, world.papers.grain],
            environment: studio.texture,
          },
    [world, studio],
  );
  const warmed = usePrewarmed(warmable);
  if (world === null || studio === null || !warmed) {
    return null;
  }
  return { world, studio };
}
