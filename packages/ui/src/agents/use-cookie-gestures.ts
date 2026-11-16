"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useRef, useState } from "react";

import { mounted } from "../lib/mounted.ts";
import { float, open, poseOpen, press, release, rest } from "./fortune-choreography.ts";
import type { CookieLayout } from "./fortune-geometry.ts";
import { cookieParts, placeCookie } from "./fortune-parts.ts";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ALLOW_MOTION = "(prefers-reduced-motion: no-preference)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
/* On arrival, the cookie stays whole for a breath once the whole scene is on screen, then opens by itself. */
const ARRIVAL_WAIT = 0.7;

type CookieState = "rest" | "pressed" | "opening" | "open";

interface CookieOptions {
  layout: CookieLayout | null;
  split: number;
  trigger: "click" | "arrival";
}

interface CookieMachine {
  current: RefObject<CookieState>;
  moveTo: (next: CookieState) => void;
}

function partsOf(root: RefObject<HTMLElement | null>) {
  return root.current === null ? undefined : cookieParts(root.current);
}

/* Opens the cookie unless it is already opening; the paper takes focus if the button had it. */
function openCookie(
  root: RefObject<HTMLElement | null>,
  machine: CookieMachine,
  options: CookieOptions,
): void {
  const parts = partsOf(root);
  const state = machine.current.current;
  if (parts === undefined || options.layout === null || state === "opening" || state === "open") {
    return;
  }
  if (state === "rest") {
    press(parts);
  }
  const hadFocus = root.current?.contains(document.activeElement) === true;
  machine.moveTo("opening");
  open(parts, options.layout, {
    onSettled: () => {
      machine.moveTo("open");
      if (hadFocus) {
        parts.paper.focus({ preventScroll: true });
      }
    },
  });
}

/* Lays the scene out and sets its first state: at rest (opening on arrival if asked), or open under
   reduced motion and after a resize once open. */
function useCookieScene(
  root: RefObject<HTMLElement | null>,
  machine: CookieMachine,
  options: CookieOptions,
): void {
  const { layout, split, trigger } = options;
  useGSAP(
    () => {
      const element = mounted(root);
      const parts = cookieParts(element);
      if (layout === null || parts === undefined) {
        return;
      }
      placeCookie(element, { layout, split });
      const media = gsap.matchMedia();
      media.add(REDUCE_MOTION, () => {
        poseOpen(parts);
        machine.moveTo("open");
      });
      media.add(ALLOW_MOTION, () => {
        if (machine.current.current === "open") {
          poseOpen(parts);
          return;
        }
        rest(parts, layout);
        machine.moveTo("rest");
        float(parts);
        ScrollTrigger.create({
          trigger: element,
          onToggle: (self) => {
            if (machine.current.current === "rest") {
              for (const drift of gsap.getTweensOf(parts.float)) {
                drift.paused(!self.isActive);
              }
            }
          },
        });
        if (trigger === "arrival") {
          ScrollTrigger.create({
            trigger: element,
            start: "bottom bottom",
            once: true,
            onEnter: () => {
              gsap.delayedCall(ARRIVAL_WAIT, () => {
                openCookie(root, machine, options);
              });
            },
          });
        }
      });
    },
    { scope: root, dependencies: [layout, split, trigger], revertOnUpdate: true },
  );
}

interface CookieGestures {
  open: boolean;
  opening: boolean;
  press: () => void;
  release: () => void;
  openNow: () => void;
}

/* The cookie's states: at rest, pressed (cracked), opening, open. Reduced motion: open at once. */
export function useCookieGestures(
  root: RefObject<HTMLElement | null>,
  options: CookieOptions,
): CookieGestures {
  const [state, setState] = useState<CookieState>("rest");
  const current = useRef<CookieState>("rest");
  const machine: CookieMachine = {
    current,
    moveTo: (next) => {
      current.current = next;
      setState(next);
    },
  };
  useCookieScene(root, machine, options);

  return {
    open: state === "open",
    opening: state === "opening",
    press: () => {
      const parts = partsOf(root);
      if (parts !== undefined && current.current === "rest") {
        press(parts);
        machine.moveTo("pressed");
      }
    },
    release: () => {
      const parts = partsOf(root);
      if (parts !== undefined && current.current === "pressed") {
        release(parts);
        machine.moveTo("rest");
      }
    },
    openNow: () => {
      openCookie(root, machine, options);
    },
  };
}
