import type { Crease } from "../agents/paper-crumple-model.ts";
import { packCreases } from "./paper-crumple-geometry.ts";
import type { PaperCrumpleWorld } from "./paper-crumple-world.ts";

/* The stable driver object the stage mutates and the scene reads each frame (the `progress`-object pattern of the
   other stages). `crumple` (0 flat, 1 balled) is already stepped by the stage's spring; the pose only reflects it. */
export interface PaperSheet {
  crumple: number;
  creases: readonly Crease[];
  pointer: { u: number; v: number } | null;
}

/* Writes the sheet's state into the material's shared uniforms. No integration here: the stage's interaction owns the
   spring, so a frame only mirrors the driver (like `poseCoupe`). */
export function posePaperCrumple(world: PaperCrumpleWorld, sheet: PaperSheet): void {
  const { uniforms } = world;
  uniforms.uCrumple.value = sheet.crumple;
  uniforms.uCreases.value = packCreases(sheet.creases);
  if (sheet.pointer === null) {
    uniforms.uPointerActive.value = 0;
    return;
  }
  uniforms.uPointer.value.set(sheet.pointer.u, sheet.pointer.v);
  uniforms.uPointerActive.value = 1;
}
