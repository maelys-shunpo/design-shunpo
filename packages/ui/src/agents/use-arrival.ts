import { useEffect, useState } from "react";

import { inWindow } from "../motion/enter-unseen.ts";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/* The share of the root that must show, above the bottom quarter of the window, before its entrance plays: the
   visitor sees it play in full instead of at the window's edge. */
const SEEN = 0.3;
const WATCH = { threshold: SEEN, rootMargin: "0px 0px -25% 0px" };

type EffectCleanup = (() => void) | undefined;

/* Whether the root's content has arrived, for an entrance played in CSS, as `enterUnseen` does for GSAP: content in the
   window when the page hydrates, and any content under reduced motion, has arrived as painted; content not seen yet
   waits in its first state until a third of it is well inside the window. */
export function useArrival(root: HTMLElement | null): boolean {
  const [arrived, setArrived] = useState(true);

  useEffect((): EffectCleanup => {
    if (root === null || inWindow(root) || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    /* The first report comes at once: out of the window, the content waits until it is seen. */
    const observer = new IntersectionObserver((entries) => {
      const seen = entries.some((entry) => entry.intersectionRatio >= SEEN);
      setArrived(seen);
      if (seen) {
        observer.disconnect();
      }
    }, WATCH);
    observer.observe(root);
    return () => {
      observer.disconnect();
    };
  }, [root]);

  return arrived;
}
