"use client";

import { gsap } from "gsap";
import { useEffect } from "react";

/* Only where a mouse hovers: a finger scrolls, so touch leaves the paper plain. */
const MOUSE = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* The light follows the pointer a beat behind, so the paper has weight. */
const FOLLOW = 0.5;

type EffectCleanup = (() => void) | undefined;

/* Loaded once idle: lights the paper under the pointer. The surface is the sheen layer's own parent (a cut
   `agents-sheet`); the layer carries the light (`--sheen-x/y`, `--sheen-on`), smoothed toward the pointer. */
export function PaperSheenMotion({ layer }: { layer: HTMLElement | null }): null {
  useEffect((): EffectCleanup => {
    const host = layer?.parentElement ?? null;
    if (layer === null || host === null) {
      return undefined;
    }
    const sheen = layer;
    const surface = host;
    if (window.matchMedia(REDUCED_MOTION).matches || !window.matchMedia(MOUSE).matches) {
      return undefined;
    }
    const position = { x: 50, y: 50 };
    const toX = gsap.quickTo(position, "x", {
      duration: FOLLOW,
      ease: "power3.out",
      onUpdate: () => {
        sheen.style.setProperty("--sheen-x", `${String(position.x)}%`);
      },
    });
    const toY = gsap.quickTo(position, "y", {
      duration: FOLLOW,
      ease: "power3.out",
      onUpdate: () => {
        sheen.style.setProperty("--sheen-y", `${String(position.y)}%`);
      },
    });
    function follow(event: PointerEvent): void {
      const box = surface.getBoundingClientRect();
      toX(((event.clientX - box.left) / box.width) * 100);
      toY(((event.clientY - box.top) / box.height) * 100);
    }
    function light(): void {
      sheen.style.setProperty("--sheen-on", "1");
    }
    function dim(): void {
      sheen.style.setProperty("--sheen-on", "0");
    }
    surface.addEventListener("pointerenter", light);
    surface.addEventListener("pointermove", follow);
    surface.addEventListener("pointerleave", dim);
    return () => {
      surface.removeEventListener("pointerenter", light);
      surface.removeEventListener("pointermove", follow);
      surface.removeEventListener("pointerleave", dim);
      gsap.killTweensOf(position);
      sheen.style.removeProperty("--sheen-on");
    };
  }, [layer]);
  return null;
}
