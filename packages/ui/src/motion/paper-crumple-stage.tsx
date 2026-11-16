"use client";

import { lazy, type ReactNode, useEffect, useState } from "react";

import { Surface } from "../agents/surface.tsx";
import { cn } from "../lib/cn.ts";
import { Stage } from "./stage.tsx";

/* One import for the stage to prepare and the lazy scene to render (three.js and GSAP load with it, never before). */
function loadPaperCrumpleScene() {
  return import("../scene/paper-crumple-scene.tsx");
}

const LazyPaperCrumpleScene = lazy(async () => {
  const { PaperCrumpleScene } = await loadPaperCrumpleScene();
  return { default: PaperCrumpleScene };
});

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* If the scene never goes live, the message must still read: show the copy this long after mount at the latest. */
const SAFETY_MS = 1500;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION);
    function update(): void {
      setReduced(query.matches);
    }
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
    };
  }, []);
  return reduced;
}

interface PaperCrumpleStageProps {
  /* The message, laid over the sheet; it fades out while the sheet crumples and back in once it settles. */
  children: ReactNode;
  onArrived?: (() => void) | undefined;
}

/* The flat paper the scene draws in 3D: the first paint, and the still shown under reduced motion or without WebGL2. */
const flatSheet = <Surface className="size-full" paper="paper" cut="lg" shadow="lift" />;

/* The 404's sheet: the crumpling three.js paper under the message. The canvas sits in an aria-hidden layer (the game is
   decorative); the copy is real HTML over it, so the keyboard and screen readers reach the title and the home call
   directly. Under reduced motion or without WebGL2 the flat sheet shows with the copy, no canvas, no game. */
export function PaperCrumpleStage({ children, onArrived }: PaperCrumpleStageProps) {
  const reduced = useReducedMotion();
  const [crumpling, setCrumpling] = useState(true);
  const [safety, setSafety] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSafety(true);
    }, SAFETY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* The message shows at once under reduced motion (no scene), as soon as the unfold ends, or by the safety deadline. */
  const showCopy = reduced || safety || !crumpling;

  return (
    <div data-slot="paper-crumple" className="relative isolate" style={{ touchAction: "none" }}>
      <div aria-hidden className="absolute inset-0">
        <Stage
          className="size-full"
          poster={flatSheet}
          posterExit="cut"
          prepareScene={loadPaperCrumpleScene}
          renderScene={(scene) => (
            <LazyPaperCrumpleScene
              {...scene}
              onArrived={onArrived}
              onCrumplingChange={setCrumpling}
            />
          )}
        />
      </div>
      <div
        className={cn(
          "relative grid place-items-center p-12 transition-opacity duration-500 ease-shift",
          showCopy ? "opacity-100" : "opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
