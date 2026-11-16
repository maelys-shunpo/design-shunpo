"use client";

import { gsap } from "gsap";
import { useEffect } from "react";

import { frameAround } from "../lib/frame-jump.ts";
import { travellingFrame, type TravellingFrame } from "../motion/travelling-frame.ts";
import {
  type CursorForm,
  type CursorMode,
  type CursorTravel,
  defaultCursorMode,
  isCursorMode,
  scrubProgress,
} from "./cursor-model.ts";

/* A custom cursor is for a mouse only: a finger scrolls, so touch keeps the system cursor. */
const MOUSE = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/* The point follows with next to no lag in the coupe form; satin and carre let it trail a touch for a softer read. */
const FOLLOW = { coupe: 0.06, satin: 0.12, carre: 0.12 } as const;
/* The satin ring trails further behind the dot, which is what gives it its weight. */
const RING_FOLLOW = 0.26;
/* How far the frame or hugging outline stands off what it designates. */
const FRAME_PAD = 6;

type EffectCleanup = (() => void) | undefined;
type Tone = "paper" | "night";

interface CursorMotionProps {
  layer: HTMLElement | null;
  dot: HTMLElement | null;
  ring: HTMLElement | null;
  frame: HTMLElement | null;
  form: CursorForm;
  travel: CursorTravel;
}

/* Everything the handlers write through: the elements, the form and travel, and a key per designated target. */
interface Ctx {
  layer: HTMLElement;
  dot: HTMLElement;
  frame: HTMLElement;
  framer: TravellingFrame;
  form: CursorForm;
  travel: CursorTravel;
  reduced: boolean;
  keyFor: (element: Element) => string;
}

function traitsOf(element: Element): { tagName: string; role: string | null; editable: boolean } {
  return {
    tagName: element.tagName,
    role: element.getAttribute("role"),
    editable: element instanceof HTMLElement && element.isContentEditable,
  };
}

/* The mode an element asks for by `data-cursor`, or the sensible default for what it is. */
function modeFor(element: Element): CursorMode {
  const asked = element.closest<HTMLElement>("[data-cursor]")?.dataset["cursor"];
  return isCursorMode(asked) ? asked : defaultCursorMode(traitsOf(element));
}

/* What a designate or scrub mode points at: the element that named the mode, or the one under the pointer. */
function targetOf(element: Element): Element {
  return element.closest("[data-cursor]") ?? element;
}

/* The ground's scheme under the pointer, from the nearest island of either polarity (a `Section`'s `data-scheme`, or a
   `scheme-dark` / `scheme-light` class as `HeroFilm` sets it): Kome on the night, ink on paper. */
function tone(element: Element): Tone {
  const scope = element.closest(".scheme-dark, .scheme-light, [data-scheme]");
  if (scope === null) {
    return "paper";
  }
  const dark =
    scope.classList.contains("scheme-dark") ||
    (scope instanceof HTMLElement && scope.dataset["scheme"] === "dark");
  return dark ? "night" : "paper";
}

/* A glide (or a reduced-motion placement) sets the frame's box straight on the element, with no ghost. */
function glideFrame(ctx: Ctx, element: Element, instant: boolean): void {
  const { frame } = ctx;
  const box = frameAround(element.getBoundingClientRect(), { left: 0, top: 0 }, FRAME_PAD);
  frame.dataset["tone"] = tone(element);
  frame.dataset["form"] = ctx.form;
  frame.toggleAttribute("data-instant", instant);
  frame.style.setProperty("translate", `${String(box.x)}px ${String(box.y)}px`);
  frame.style.setProperty("width", `${String(box.width)}px`);
  frame.style.setProperty("height", `${String(box.height)}px`);
  if (instant) {
    frame.getBoundingClientRect();
    frame.toggleAttribute("data-instant", false);
  }
  frame.toggleAttribute("data-shown", true);
}

/* Satin always glides its hugging outline; coupe jumps with ghosts on shift, glides on glide. */
function framerDriven(ctx: Ctx): boolean {
  return ctx.form === "coupe" && ctx.travel === "shift" && !ctx.reduced;
}

function designate(ctx: Ctx, element: Element): void {
  if (framerDriven(ctx)) {
    const box = frameAround(element.getBoundingClientRect(), { left: 0, top: 0 }, FRAME_PAD);
    ctx.framer.show(ctx.keyFor(element), box, { tone: tone(element) });
  } else {
    glideFrame(ctx, element, ctx.reduced);
  }
}

function hideFrame(ctx: Ctx): void {
  if (framerDriven(ctx)) {
    ctx.framer.hide();
  } else {
    ctx.frame.toggleAttribute("data-shown", false);
  }
}

/* Writes the layer's mode and tone for what is under the pointer, and places the frame or fills the scrub line. */
function render(ctx: Ctx, mode: CursorMode, under: Element): void {
  const { layer, dot } = ctx;
  layer.dataset["tone"] = tone(under);
  if (mode === "native") {
    document.documentElement.style.cursor = "";
    layer.dataset["mode"] = "native";
    hideFrame(ctx);
    return;
  }
  document.documentElement.style.cursor = "none";
  if (mode === "designate") {
    layer.dataset["mode"] = "designate";
    designate(ctx, targetOf(under));
    return;
  }
  hideFrame(ctx);
  if (mode === "scrub") {
    const scene = targetOf(under).getBoundingClientRect();
    const read = scrubProgress({ top: scene.top, height: scene.height }, window.innerHeight);
    dot.style.setProperty("--scrub", `${String(read * 100)}%`);
  }
  layer.dataset["mode"] = mode;
}

function keyRing(): (element: Element) => string {
  const keys = new WeakMap<Element, number>();
  let next = 0;
  return (element) => {
    let key = keys.get(element);
    if (key === undefined) {
      next += 1;
      key = next;
      keys.set(element, key);
    }
    return `k${String(key)}`;
  };
}

/* The dot follows close, the satin ring trails behind it; one call moves both. */
function followers(
  dot: HTMLElement,
  ring: HTMLElement,
  form: CursorForm,
): (x: number, y: number) => void {
  const toX = gsap.quickTo(dot, "x", { duration: FOLLOW[form], ease: "power2.out" });
  const toY = gsap.quickTo(dot, "y", { duration: FOLLOW[form], ease: "power2.out" });
  const ringX = gsap.quickTo(ring, "x", { duration: RING_FOLLOW, ease: "power3.out" });
  const ringY = gsap.quickTo(ring, "y", { duration: RING_FOLLOW, ease: "power3.out" });
  return (x, y) => {
    toX(x);
    toY(y);
    ringX(x);
    ringY(y);
  };
}

/* Loaded once the page is idle: it moves the point and places the frame. GSAP, Lenis and this module never touch the
   first paint. The system cursor is hidden only while a point is shown; a typed field or a dropped chunk keeps it. */
export function CursorMotion({ layer, dot, ring, frame, form, travel }: CursorMotionProps): null {
  useEffect((): EffectCleanup => {
    if (
      layer === null ||
      dot === null ||
      ring === null ||
      frame === null ||
      !window.matchMedia(MOUSE).matches
    ) {
      return undefined;
    }
    const root = document.documentElement;
    const was = root.style.cursor;
    const follow = followers(dot, ring, form);
    const ctx: Ctx = {
      layer,
      dot,
      frame,
      framer: travellingFrame(layer, frame, "data-cursor-ghost"),
      form,
      travel,
      reduced: window.matchMedia(REDUCED_MOTION).matches,
      keyFor: keyRing(),
    };
    function move(event: PointerEvent): void {
      if (event.pointerType !== "mouse") {
        return;
      }
      follow(event.clientX, event.clientY);
      const under =
        event.target instanceof Element
          ? event.target
          : document.elementFromPoint(event.clientX, event.clientY);
      if (under !== null) {
        render(ctx, modeFor(under), under);
      }
    }
    function leave(): void {
      root.style.cursor = was;
      ctx.layer.dataset["mode"] = "native";
      hideFrame(ctx);
    }
    const listening = new AbortController();
    document.addEventListener("pointermove", move, { signal: listening.signal });
    document.addEventListener("pointerleave", leave, { signal: listening.signal });
    return () => {
      listening.abort();
      gsap.killTweensOf(dot);
      gsap.killTweensOf(ring);
      ctx.framer.dispose();
      root.style.cursor = was;
      delete ctx.layer.dataset["mode"];
      delete ctx.layer.dataset["tone"];
    };
  }, [layer, dot, ring, frame, form, travel]);
  return null;
}
