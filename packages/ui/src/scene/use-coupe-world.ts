import { useThree } from "@react-three/fiber";

import type { QualityTier } from "../lib/quality-tier.ts";
import { type CoupeWorld, createCoupeWorld, disposeCoupeWorld } from "./coupe-world.ts";
import { useSceneResource } from "./use-scene-resource.ts";

/* The coupe's world, made in an effect and disposed with it: null until the canvas exists and it is built. */
export function useCoupeWorld(tier: QualityTier): CoupeWorld | null {
  const canvas = useThree((state) => state.gl.domElement);
  return useSceneResource(createCoupeWorld, disposeCoupeWorld, canvas, tier);
}
