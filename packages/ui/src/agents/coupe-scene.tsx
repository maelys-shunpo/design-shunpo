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
function useCoupeState(progress: { value: number }): CoupeState {
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
        setPose(next);
        setGestureActive(gestureProgress(value) > 0);
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
  }, [progress]);

  return { pose, gestureActive, revealed, motionActive };
}

interface FocusRescue {
  faq: RefObject<HTMLDivElement | null>;
  halves: RefObject<HTMLDivElement | null>;
  closing: RefObject<HTMLDivElement | null>;
  motionActive: boolean;
  revealed: boolean;
}

/* When the cut reveals the closing, the FAQ layer and the frozen halves turn inert; if the focus was still inside
   them (a reader had opened an answer), hand it to the closing so it never stays trapped in an inert layer. */
function useFocusRescue({ faq, halves, closing, motionActive, revealed }: FocusRescue) {
  useEffect(() => {
    if (!motionActive || !revealed) {
      return;
    }
    const active = document.activeElement;
    const trapped =
      (faq.current?.contains(active) ?? false) || (halves.current?.contains(active) ?? false);
    if (trapped) {
      closing.current?.focus();
    }
  }, [faq, halves, closing, motionActive, revealed]);
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
  const { pose, gestureActive, revealed, motionActive } = useCoupeState(progress);
  const faqRef = useRef<HTMLDivElement>(null);
  const halvesRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);
  useFocusRescue({ faq: faqRef, halves: halvesRef, closing: closingRef, motionActive, revealed });

  return (
    <div
      data-slot="coupe-scene"
      data-coupe-layer="scene"
      className="agents-grain relative min-h-svh w-full overflow-clip bg-background scheme-dark"
    >
      <div
        ref={faqRef}
        data-coupe-layer="faq"
        className={cn(
          "relative w-full",
          gestureActive
            ? "md:motion-safe:hidden"
            : "md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:z-10 md:motion-safe:grid md:motion-safe:place-items-center md:motion-safe:overflow-clip",
        )}
      >
        {faq}
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
        ref={halvesRef}
        data-coupe-layer="halves"
        aria-hidden={revealed ? true : undefined}
        inert={revealed}
        className={cn(
          "hidden md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:z-20 md:motion-safe:overflow-clip",
          gestureActive && "md:motion-safe:block",
        )}
      >
        <CoupeHalves pose={pose}>{faq}</CoupeHalves>
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
