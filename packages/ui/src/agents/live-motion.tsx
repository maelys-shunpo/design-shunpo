"use client";

import { useEffect } from "react";

import { buildLiveScript } from "./live-timeline.ts";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type EffectCleanup = (() => void) | undefined;

interface LiveMotionProps {
  root: HTMLElement | null;
  hold: number;
}

interface Playback {
  inView: boolean;
  held: boolean;
}

function listen(root: HTMLElement, playback: Playback, update: () => void): AbortController {
  const listening = new AbortController();
  const options = { signal: listening.signal };
  function holdIt(): void {
    Object.assign(playback, { held: true });
    update();
  }
  function release(): void {
    Object.assign(playback, { held: false });
    update();
  }
  root.addEventListener("pointerenter", holdIt, options);
  root.addEventListener("focusin", holdIt, options);
  root.addEventListener("pointerleave", release, options);
  root.addEventListener("focusout", release, options);
  return listening;
}

function watch(root: HTMLElement, holdSeconds: number): () => void {
  const script = buildLiveScript(root, holdSeconds);
  /* The page painted the finished state: start there, so nothing the visitor saw disappears at once. */
  script.timeline.seek(script.finished);
  const playback: Playback = { inView: false, held: false };
  function update(): void {
    script.timeline.paused(!playback.inView || playback.held);
  }
  const observer = new IntersectionObserver((entries) => {
    playback.inView = entries.some((entry) => entry.isIntersecting);
    update();
  });
  observer.observe(root);
  const listening = listen(root, playback, update);
  return () => {
    observer.disconnect();
    listening.abort();
    script.revert();
  };
}

/* Loaded once the page is idle: replays a live surface while it is in view, never under reduced motion. */
export function LiveMotion({ root, hold }: LiveMotionProps): null {
  useEffect((): EffectCleanup => {
    if (root === null || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    let stop: (() => void) | undefined;
    let mounted = true;
    async function start(target: HTMLElement): Promise<void> {
      await document.fonts.ready;
      if (mounted) {
        stop = watch(target, hold);
      }
    }
    void start(root);
    return () => {
      mounted = false;
      stop?.();
    };
  }, [root, hold]);
  return null;
}
