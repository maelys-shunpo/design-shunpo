import { useEffect, useRef, useState } from "react";

import type { ActionState } from "./action.tsx";

/* How long the agent « thinks » before it answers, then how long the check stays. */
const THINK_MS = 700;
const DONE_MS = 380;

/* A short, honest beat between a question and its answer: the action shows a spinner, then a check, then the answer
   appears. Presses during the beat are ignored; under reduced motion the answer appears at once. */
export function useThinking(): [ActionState, (answer: () => void) => void] {
  const [state, setState] = useState<ActionState>("idle");
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const timer of timers.current) {
        window.clearTimeout(timer);
      }
    },
    [],
  );

  function think(answer: () => void): void {
    if (state !== "idle") {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      answer();
      return;
    }
    setState("busy");
    timers.current = [
      window.setTimeout(() => {
        setState("done");
      }, THINK_MS),
      window.setTimeout(() => {
        setState("idle");
        answer();
      }, THINK_MS + DONE_MS),
    ];
  }

  return [state, think];
}
