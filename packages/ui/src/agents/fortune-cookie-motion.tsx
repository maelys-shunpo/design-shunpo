"use client";

import { useEffect, useRef } from "react";

import type { CookieArtGeometry } from "./fortune-geometry.ts";
import { useCookieCursor } from "./use-cookie-cursor.ts";
import { useCookieGestures } from "./use-cookie-gestures.ts";
import { useCookieLayout } from "./use-cookie-layout.ts";

/* What the static scene shows of the cookie's state, and what its button calls once the motion has loaded. */
export interface CookieControls {
  press: () => void;
  release: () => void;
  open: () => void;
}

export type CookieShown = "closed" | "opening" | "open";

interface CookieMotionProps {
  root: HTMLDivElement;
  art: CookieArtGeometry & { split: number };
  trigger: "click" | "arrival";
  onShown: (shown: CookieShown) => void;
  onControls: (controls: CookieControls) => void;
}

function shownOf(cookie: { open: boolean; opening: boolean }): CookieShown {
  if (cookie.open) {
    return "open";
  }
  return cookie.opening ? "opening" : "closed";
}

/* The cookie's motion, loaded once the page is idle (`FortuneCookie`): it lays the painted scene out for its width,
   floats it, gives it its pointer and opens it; the scene shows the state it reports. */
export function CookieMotion({ root, art, trigger, onShown, onControls }: CookieMotionProps) {
  const scene = useRef(root);
  const layout = useCookieLayout(scene, art);
  useCookieCursor(scene);
  const cookie = useCookieGestures(scene, { layout, split: art.split, trigger });
  const shown = shownOf(cookie);

  useEffect(() => {
    onShown(shown);
  }, [shown, onShown]);
  useEffect(() => {
    onControls({ press: cookie.press, release: cookie.release, open: cookie.openNow });
  });

  return null;
}
