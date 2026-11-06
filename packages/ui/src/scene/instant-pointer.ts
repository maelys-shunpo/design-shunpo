import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect } from "react";

import { duration, ease } from "../motion/tokens.ts";
import type { InstantUniforms } from "./instant-points.ts";

/* Leaving the window or the tab sends no pointermove: these release the ink too. */
const RELEASES = ["blur", "pointercancel"] as const;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/* Where a pointer at (clientX, clientY) is on the canvas box, in clip space, and how hard it parts the ink there:
   fully inside the canvas, not at all outside it. */
export function pointerTarget(
  { clientX, clientY }: { clientX: number; clientY: number },
  box: Box,
): [x: number, y: number, strength: number] {
  const x = ((clientX - box.left) / box.width) * 2 - 1;
  const y = 1 - ((clientY - box.top) / box.height) * 2;
  const inside = Math.abs(x) <= 1 && Math.abs(y) <= 1;
  return [x, y, inside ? 1 : 0];
}

/* The mouse over the canvas, in clip space, smoothed on the GSAP ticker: x and y where it is, z how hard it
   parts the ink. A finger means scroll, so only a mouse parts it; leaving the canvas lets the ink close again.
   Listened on the window, because copy laid over the canvas would swallow canvas events. */
export function useInkPointer({ uPointer }: InstantUniforms): void {
  const canvas = useThree((state) => state.gl.domElement);
  useEffect(() => {
    const smooth = { duration: duration.slow, ease: ease.standard };
    const toX = gsap.quickTo(uPointer.value, "x", smooth);
    const toY = gsap.quickTo(uPointer.value, "y", smooth);
    const toStrength = gsap.quickTo(uPointer.value, "z", smooth);
    const listening = new AbortController();
    const options = { passive: true, signal: listening.signal };
    function follow(event: PointerEvent): void {
      if (event.pointerType !== "mouse") {
        return;
      }
      const [x, y, strength] = pointerTarget(event, canvas.getBoundingClientRect());
      toX(x);
      toY(y);
      toStrength(strength);
    }
    function release(): void {
      toStrength(0);
    }
    window.addEventListener("pointermove", follow, options);
    for (const type of RELEASES) {
      window.addEventListener(type, release, options);
    }
    document.documentElement.addEventListener("pointerleave", release, options);
    return () => {
      listening.abort();
      gsap.killTweensOf(uPointer.value);
    };
  }, [canvas, uPointer]);
}
