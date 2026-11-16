"use client";

import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";

import { cn } from "../lib/cn.ts";
import { gestureProgress } from "../motion/coupe-geometry.ts";
import { type CoupeDomPose, poseCoupeDom } from "../scene/coupe-dom-pose.ts";
import { CoupeBlade } from "./coupe-blade.tsx";
import { CoupeHalves } from "./coupe-halves.tsx";

/* The gesture plays only from tablets up and with motion, exactly where `md:motion-safe:` paints its layers: the base
   DOM below is the still reading layout for phones, reduced motion and desktop before the scene's script runs. */
const MOTION_QUERY = "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";

type EffectCleanup = (() => void) | undefined;

interface CoupeState {
  pose: CoupeDomPose;
  /* True once the dwell is over and the cut has begun: the live FAQ gives way to the frozen falling copies. */
  gestureActive: boolean;
  /* True once the halves have parted enough to read the closing beneath. */
  revealed: boolean;
  /* True only where the gesture runs (desktop with motion); off it the scene is the still reading layout. */
  motionActive: boolean;
}

/* The scroll's progress, read each frame into the pose and the a11y state. Off the gesture (phones, reduced motion)
   the loop never runs and the scene rests as the still: nothing held, nothing hidden, nothing frozen. */
function useCoupeState(
  progress: { value: number },
  faq: RefObject<HTMLDivElement | null>,
  scene: RefObject<HTMLDivElement | null>,
): CoupeState {
  const [pose, setPose] = useState(() => poseCoupeDom(0));
  const [gestureActive, setGestureActive] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [motionActive, setMotionActive] = useState(false);

  useEffect((): EffectCleanup => {
    const media = window.matchMedia(MOTION_QUERY);
    let frame = 0;
    let last = Number.NaN;

    function apply() {
      const value = progress.value;
      if (value !== last) {
        last = value;
        const next = poseCoupeDom(value);
        const gesturing = gestureProgress(value) > 0;
        /* The live FAQ is hidden the moment the gesture starts: park the focus first, while its holder still exists. */
        if (gesturing) {
          parkFocusOnScene(faq.current, scene.current);
        }
        setPose(next);
        setGestureActive(gesturing);
        setRevealed(next.revealed);
      }
      frame = requestAnimationFrame(apply);
    }

    function update() {
      cancelAnimationFrame(frame);
      if (media.matches) {
        setMotionActive(true);
        frame = requestAnimationFrame(apply);
        return;
      }
      setMotionActive(false);
      setPose(poseCoupeDom(0));
      setGestureActive(false);
      setRevealed(false);
    }

    update();
    media.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    };
  }, [progress, faq, scene]);

  return { pose, gestureActive, revealed, motionActive };
}

interface FocusHandover {
  scene: RefObject<HTMLDivElement | null>;
  closing: RefObject<HTMLDivElement | null>;
  motionActive: boolean;
  revealed: boolean;
}

/* Once the closing is revealed and reachable, take the focus parked on the scene (when the live FAQ went away) onto
   the closing. A reader who had focused nothing keeps their place. */
function useFocusHandover({ scene, closing, motionActive, revealed }: FocusHandover) {
  useEffect(() => {
    if (!motionActive || !revealed) {
      return;
    }
    if (document.activeElement === scene.current) {
      closing.current?.focus();
    }
  }, [scene, closing, motionActive, revealed]);
}

/* Focus inside the live FAQ moves to the scene itself (never inert) before the FAQ is hidden, so it is not lost. */
function parkFocusOnScene(faq: HTMLElement | null, scene: HTMLElement | null) {
  if (faq?.contains(document.activeElement) ?? false) {
    scene?.focus();
  }
}

/* One paper surface for the live FAQ and the frozen halves, so the swap at the gesture's start shows no jump and the
   closing behind never shows through. */
function PaperFaq({ children }: { children: ReactNode }) {
  return (
    <div className="grid size-full place-items-center agents-washi bg-background scheme-light">
      {children}
    </div>
  );
}

interface CoupeSceneProps {
  /* The live, interactive FAQ, read first and cut by the gesture; the same node feeds the frozen falling copies. */
  faq: ReactNode;
  /* The closing uncovered once the halves fall away: the title and the one call. */
  children: ReactNode;
  /* A stable { value } object the page's scroll choreography tweens from 0 to 1 across the held scene. */
  progress: { value: number };
}

/* The combined scene: the real FAQ, a reading dwell, then the coupe gesture played on it to uncover the closing. The
   base DOM is the still reading layout, the FAQ then the closing in normal flow, both whole and reachable. The
   `md:motion-safe:` layers add the pinned gesture on desktop with motion: the closing lies behind (inert while
   covered), the live FAQ above it during the dwell, then the frozen `CoupeHalves` fall and the `CoupeBlade` crosses
   on top; once the closing is read the frozen FAQ is hidden from assistive tech. */
export function CoupeScene({ faq, children, progress }: CoupeSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);
  const { pose, gestureActive, revealed, motionActive } = useCoupeState(progress, faqRef, sceneRef);
  useFocusHandover({ scene: sceneRef, closing: closingRef, motionActive, revealed });
  const paperFaq = <PaperFaq>{faq}</PaperFaq>;

  return (
    <div
      ref={sceneRef}
      tabIndex={-1}
      data-slot="coupe-scene"
      data-coupe-layer="scene"
      className="agents-grain relative min-h-svh w-full overflow-clip bg-background scheme-dark outline-none"
    >
      <div
        ref={faqRef}
        data-coupe-layer="faq"
        className={cn(
          "relative w-full",
          gestureActive
            ? "md:motion-safe:hidden"
            : "md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:z-10 md:motion-safe:overflow-clip",
        )}
      >
        {paperFaq}
      </div>
      <div
        ref={closingRef}
        data-coupe-layer="closing"
        tabIndex={-1}
        inert={motionActive && !revealed}
        className="relative w-full outline-none md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:z-0 md:motion-safe:grid md:motion-safe:place-items-center"
      >
        {children}
      </div>
      <div
        data-coupe-layer="halves"
        aria-hidden={revealed ? true : undefined}
        inert
        className={cn(
          "hidden md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:z-20 md:motion-safe:overflow-clip",
          gestureActive && "md:motion-safe:block",
        )}
      >
        <CoupeHalves pose={pose}>{paperFaq}</CoupeHalves>
      </div>
      <div
        data-coupe-layer="blade"
        aria-hidden="true"
        className="pointer-events-none hidden md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:z-30 md:motion-safe:block"
      >
        <CoupeBlade pose={pose} />
      </div>
    </div>
  );
}
