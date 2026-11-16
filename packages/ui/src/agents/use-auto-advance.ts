import { useEffect, useState } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type EffectCleanup = (() => void) | undefined;

interface AutoAdvance {
  root: HTMLElement | null;
  count: number;
  /* How long each item stays before the next, in milliseconds. */
  every: number;
  /* Moves to the next item; a new function restarts the timer, so it changes with the active item. */
  advance: () => void;
}

/* Runs only while the root is in view, not under the pointer, and never under reduced motion. Returns whether it runs. */
export function useAutoAdvance({ root, count, every, advance }: AutoAdvance): boolean {
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect((): EffectCleanup => {
    if (root === null) {
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      const intersecting = entries.some((entry) => entry.isIntersecting);
      setInView(intersecting && !window.matchMedia(REDUCED_MOTION).matches);
    });
    observer.observe(root);
    const listening = new AbortController();
    const options = { signal: listening.signal };
    root.addEventListener(
      "pointerenter",
      () => {
        setHeld(true);
      },
      options,
    );
    root.addEventListener(
      "pointerleave",
      () => {
        setHeld(false);
      },
      options,
    );
    return () => {
      observer.disconnect();
      listening.abort();
    };
  }, [root]);

  const running = inView && !held && count > 1;
  useEffect((): EffectCleanup => {
    if (!running) {
      return undefined;
    }
    const timer = window.setTimeout(advance, every);
    return () => {
      window.clearTimeout(timer);
    };
  }, [running, every, advance]);
  return running;
}
