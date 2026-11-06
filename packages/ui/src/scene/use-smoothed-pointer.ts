import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useState } from "react";
import { Vector2 } from "three";

import { duration, ease } from "../motion/tokens.ts";

/* The mouse over the canvas, from -1 to 1 on both axes, smoothed on the GSAP ticker. A finger means scroll: only
   mouse pointers steer. Listened on the window, because copy laid over the canvas would swallow canvas events. */
export function useSmoothedPointer(): Vector2 {
  const canvas = useThree((state) => state.gl.domElement);
  const [pointer] = useState(() => new Vector2());
  useEffect(() => {
    const toX = gsap.quickTo(pointer, "x", { duration: duration.slow, ease: ease.standard });
    const toY = gsap.quickTo(pointer, "y", { duration: duration.slow, ease: ease.standard });
    const listening = new AbortController();
    function follow(event: PointerEvent): void {
      if (event.pointerType !== "mouse") {
        return;
      }
      const box = canvas.getBoundingClientRect();
      toX(((event.clientX - box.left) / box.width) * 2 - 1);
      toY(1 - ((event.clientY - box.top) / box.height) * 2);
    }
    window.addEventListener("pointermove", follow, { passive: true, signal: listening.signal });
    return () => {
      listening.abort();
      gsap.killTweensOf(pointer);
    };
  }, [canvas, pointer]);
  return pointer;
}
