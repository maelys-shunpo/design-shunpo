import { useThree } from "@react-three/fiber";

import type { QualityTier } from "../lib/quality-tier.ts";
import {
  createPaperCrumpleWorld,
  disposePaperCrumpleWorld,
  type PaperCrumpleWorld,
} from "./paper-crumple-world.ts";
import { useSceneResource } from "./use-scene-resource.ts";

/* The crumple world, made in an effect and disposed with it: null until the canvas exists and it is built. */
export function usePaperCrumpleWorld(tier: QualityTier): PaperCrumpleWorld | null {
  const canvas = useThree((state) => state.gl.domElement);
  return useSceneResource(createPaperCrumpleWorld, disposePaperCrumpleWorld, canvas, tier);
}
