import { useThree } from "@react-three/fiber";
import { useMemo } from "react";

import type { QualityTier } from "../lib/quality-tier.ts";
import { createPaperSheet } from "./coupe-sheet.ts";
import { type CoupeWorld, createCoupeWorld, disposeCoupeWorld } from "./coupe-world.ts";
import { useSceneResource } from "./use-scene-resource.ts";

/* The coupe's world, made in an effect and disposed with it: null until the canvas exists and it is built. The sheet
   the cut reveals is the page's own Kome paper, drawn once from the canvas's resolved colour so it never tiles. */
export function useCoupeWorld(tier: QualityTier): CoupeWorld | null {
  const canvas = useThree((state) => state.gl.domElement);
  const sheet = useMemo(() => createPaperSheet(canvas, tier), [canvas, tier]);
  return useSceneResource(createCoupeWorld, disposeCoupeWorld, canvas, tier, sheet);
}
