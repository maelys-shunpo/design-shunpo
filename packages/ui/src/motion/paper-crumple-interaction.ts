import { gsap } from "gsap";

import { addCrumple, type CrumpleState, pointerToSheetUv } from "../agents/paper-crumple-model.ts";
import type { PaperSheet } from "../scene/paper-crumple-pose.ts";

/* GSAP needs CustomEase to replay the CSS `--ease-shift` cubic-bezier; power3.out stands in for it, close in feel.
   Tuned against the references in Task 5 (motion-review). */
const EASE = "power3.out";
const ARRIVAL_SECONDS = 1.2;
const HOLD_SECONDS = 0.4;
const RELEASE_SECONDS = 1;
/* How crumpled the sheet gets while the pointer is held down. */
const HELD_CRUMPLE = 0.9;

export interface CrumpleHandle {
  /* The stable driver the scene reads each frame. */
  sheet: PaperSheet;
  /* The accumulated crumple state (creases and count), behind a box so the interaction can replace it. */
  state: { current: CrumpleState };
}

/* The sheet arrives balled: crumple 1, with a couple of seeded folds already in it. Pure, so the scene can make it
   synchronously (the first frame shows the ball, before the interaction's effect runs). */
export function createCrumpleSheet(): CrumpleHandle {
  let state: CrumpleState = { count: 0, creases: [] };
  state = addCrumple(state, { u: 0.42, v: 0.55 }, 101);
  state = addCrumple(state, { u: 0.6, v: 0.4 }, 202);
  const box = { current: state };
  const sheet: PaperSheet = { crumple: 1, creases: box.current.creases, pointer: null };
  return { sheet, state: box };
}

interface InteractionOptions {
  canvas: HTMLCanvasElement;
  onCrumplingChange?: ((crumpling: boolean) => void) | undefined;
  onArrived?: (() => void) | undefined;
}

/* The arrival: unfold from the ball, keeping the seeded creases, then tell the page the message can show. */
function playArrival(sheet: PaperSheet, options: InteractionOptions): void {
  gsap.to(sheet, {
    crumple: 0,
    duration: ARRIVAL_SECONDS,
    ease: EASE,
    onComplete: () => {
      options.onCrumplingChange?.(false);
      options.onArrived?.();
    },
  });
}

/* Wires the arrival unfold and the press-to-crumple game: pointer events are read on the window (the canvas never
   takes them), mapped to the sheet's UV, and drive `sheet.crumple` with a GSAP tween. Each release adds a crease, up
   to the cap. Returns a cleanup that kills the tweens and drops the listeners. */
export function startCrumpleInteraction(
  handle: CrumpleHandle,
  { canvas, onCrumplingChange, onArrived }: InteractionOptions,
): () => void {
  const { sheet, state } = handle;
  let seed = 303;
  let holding = false;

  playArrival(sheet, { canvas, onCrumplingChange, onArrived });

  function uvAt(event: PointerEvent): { u: number; v: number } | null {
    return pointerToSheetUv({ x: event.clientX, y: event.clientY }, canvas.getBoundingClientRect());
  }

  function down(event: PointerEvent): void {
    const uv = uvAt(event);
    if (uv === null) {
      return;
    }
    holding = true;
    sheet.pointer = uv;
    onCrumplingChange?.(true);
    gsap.to(sheet, { crumple: HELD_CRUMPLE, duration: HOLD_SECONDS, ease: EASE });
  }

  function move(event: PointerEvent): void {
    if (!holding) {
      return;
    }
    const uv = uvAt(event);
    if (uv !== null) {
      sheet.pointer = uv;
    }
  }

  function up(): void {
    if (!holding) {
      return;
    }
    holding = false;
    state.current = addCrumple(state.current, sheet.pointer ?? { u: 0.5, v: 0.5 }, seed);
    seed += 101;
    sheet.creases = state.current.creases;
    sheet.pointer = null;
    gsap.to(sheet, {
      crumple: 0,
      duration: RELEASE_SECONDS,
      ease: EASE,
      onComplete: () => onCrumplingChange?.(false),
    });
  }

  const listening = new AbortController();
  const { signal } = listening;
  window.addEventListener("pointerdown", down, { signal });
  window.addEventListener("pointermove", move, { signal });
  window.addEventListener("pointerup", up, { signal });
  window.addEventListener("pointercancel", up, { signal });

  return () => {
    listening.abort();
    gsap.killTweensOf(sheet);
  };
}
