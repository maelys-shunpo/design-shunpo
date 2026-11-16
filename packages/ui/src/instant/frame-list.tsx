"use client";

import { cva } from "class-variance-authority";
import { type ReactNode, type RefObject, useEffect, useRef, useState } from "react";

import { cn } from "../lib/cn.ts";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/* Corner marks are 16 px squares (size-4): the frame's corners land on the item's own corners. */
const CORNER = 16;

const cornerVariants = cva(
  "absolute top-0 left-0 size-4 border-foreground transition-transform ease-shift motion-reduce:transition-none",
  {
    variants: {
      corner: {
        topLeft: "border-t-2 border-l-2",
        topRight: "border-t-2 border-r-2",
        bottomLeft: "border-b-2 border-l-2",
        bottomRight: "border-r-2 border-b-2",
      },
      layer: {
        head: "duration-300",
        near: "opacity-40 delay-100 duration-300",
        far: "opacity-20 delay-150 duration-300",
      },
    },
  },
);

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
type Layer = "head" | "near" | "far";

const CORNERS: Corner[] = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
/* Ghosts first, the head last, so it paints on top of its trail. */
const LAYERS: Layer[] = ["far", "near", "head"];

function cornerAt({ x, y, width, height }: Rect, corner: Corner): string {
  const right = corner === "topRight" || corner === "bottomRight";
  const bottom = corner === "bottomLeft" || corner === "bottomRight";
  return `translate3d(${right ? x + width - CORNER : x}px, ${bottom ? y + height - CORNER : y}px, 0)`;
}

function rectOf(item: Element, list: Element): Rect {
  const box = item.getBoundingClientRect();
  const origin = list.getBoundingClientRect();
  return {
    x: box.left - origin.left,
    y: box.top - origin.top,
    width: box.width,
    height: box.height,
  };
}

type EffectCleanup = (() => void) | undefined;

/* Watches the list: the frame starts on the first item, and pointing at or focusing an item moves it there. It keeps
   the item it is on, so a resize measures that one again where it now stands rather than leaving the corners behind.
   Returns what stops it. */
function watchList(element: HTMLOListElement, place: (rect: Rect) => void): () => void {
  let designated: Element | null = null;
  function moveTo(item: Element | null): void {
    if (item === null) {
      return;
    }
    designated = item;
    place(rectOf(item, element));
  }
  function designate(event: Event): void {
    moveTo(event.target instanceof Element ? event.target.closest("[data-frame-item]") : null);
  }
  const observer = new ResizeObserver(() => {
    moveTo(designated ?? element.querySelector("[data-frame-item]"));
  });
  observer.observe(element);
  const listening = new AbortController();
  element.addEventListener("pointerover", designate, { signal: listening.signal });
  element.addEventListener("focusin", designate, { signal: listening.signal });
  return () => {
    observer.disconnect();
    listening.abort();
  };
}

function useDesignated(list: RefObject<HTMLOListElement | null>): Rect | null {
  const [target, setTarget] = useState<Rect | null>(null);

  useEffect((): EffectCleanup => {
    const element = list.current;
    return element === null ? undefined : watchList(element, setTarget);
  }, [list]);

  return target;
}

/* The list whose frame designates one item at a time. Pointing at or focusing an item makes the frame jump to it:
   four corners, each moved by a transform, trailed by two fading ghosts. From the large breakpoint, with a pointer. */
export function FrameList({ children, className }: { children: ReactNode; className?: string }) {
  const list = useRef<HTMLOListElement>(null);
  const target = useDesignated(list);

  return (
    <ol ref={list} data-slot="frame-list" className={cn("relative grid", className)}>
      {children}
      {target === null ? null : (
        <li aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {LAYERS.flatMap((layer) =>
            CORNERS.map((corner) => (
              <span
                key={`${layer}-${corner}`}
                className={cornerVariants({ corner, layer })}
                style={{ transform: cornerAt(target, corner) }}
              />
            )),
          )}
        </li>
      )}
    </ol>
  );
}
