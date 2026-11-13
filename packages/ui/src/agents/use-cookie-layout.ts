"use client";

import { type RefObject, useEffect, useState } from "react";

import { mounted } from "../lib/mounted.ts";
import { type CookieArtGeometry, type CookieLayout, cookieLayout } from "./fortune-geometry.ts";

/* Narrower than this, the paper takes the phone layout: smaller panels, set under the cookie's height. */
const COMPACT_BELOW_PX = 560;

/* The scene laid out for its measured width, again on every resize; null until measured. */
export function useCookieLayout(
  root: RefObject<HTMLElement | null>,
  art: CookieArtGeometry,
): CookieLayout | null {
  const [layout, setLayout] = useState<CookieLayout | null>(null);
  useEffect(() => {
    const element = mounted(root);
    let width = 0;
    function measure(): void {
      const next = element.clientWidth;
      if (next === 0 || next === width) {
        return;
      }
      width = next;
      setLayout(cookieLayout(next, next < COMPACT_BELOW_PX, art));
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [root, art]);
  return layout;
}
