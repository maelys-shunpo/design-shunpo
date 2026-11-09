"use client";

import { gsap } from "gsap";
import { useEffect } from "react";

import { ease } from "../motion/tokens.ts";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/* Seconds a pulse takes down a thread, then how long its tool and its line stay lit before the next. */
const TRAVEL = 0.9;
const HOLD = 1.8;

type EffectCleanup = (() => void) | undefined;

function light(root: HTMLElement, selector: string, slug: string) {
  for (const element of root.querySelectorAll<HTMLElement>(selector)) {
    element.toggleAttribute(
      "data-on",
      element.dataset["hubTool"] === slug || element.dataset["hubMessage"] === slug,
    );
  }
}

/* One beat per message: the hub ripples, a pulse runs down the thread to the tool, the tool lights and the line under
   the hub says what the agent did there. */
function beats(root: HTMLElement) {
  const timeline = gsap.timeline({ repeat: -1, paused: true });
  const ring = root.querySelector("[data-hub-ring]");
  for (const message of root.querySelectorAll<HTMLElement>("[data-hub-message]")) {
    const slug = message.dataset["hubMessage"] ?? "";
    const pulses = root.querySelectorAll(`[data-hub-pulse="${slug}"]`);
    timeline.call(() => {
      light(root, "[data-hub-message]", slug);
    });
    if (ring !== null) {
      timeline.fromTo(
        ring,
        { scale: 1, opacity: 0.6 },
        { scale: 1.5, opacity: 0, duration: TRAVEL, ease: ease.standard },
        "<",
      );
    }
    timeline.fromTo(
      pulses,
      { strokeDashoffset: 12 },
      { strokeDashoffset: -100, duration: TRAVEL, ease: ease.inOut },
      "<",
    );
    timeline.call(
      () => {
        light(root, "[data-hub-tool]", slug);
      },
      [],
      `-=${String(TRAVEL / 3)}`,
    );
    timeline.to({}, { duration: HOLD });
  }
  return timeline;
}

interface ConnectionHubMotionProps {
  root: HTMLElement | null;
}

/* Plays the beats while the hub is on screen, and holds them under the pointer or focus (WCAG 2.2.2). */
export function ConnectionHubMotion({ root }: ConnectionHubMotionProps): null {
  useEffect((): EffectCleanup => {
    if (root === null || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined;
    }
    const timeline = beats(root);
    const held = { seen: false, pointer: false, focus: false };
    function update() {
      timeline.paused(!held.seen || held.pointer || held.focus);
    }
    const observer = new IntersectionObserver((entries) => {
      held.seen = entries.some((entry) => entry.isIntersecting);
      update();
    });
    observer.observe(root);
    const events: Array<[string, () => void]> = [
      [
        "pointerenter",
        () => {
          held.pointer = true;
          update();
        },
      ],
      [
        "pointerleave",
        () => {
          held.pointer = false;
          update();
        },
      ],
      [
        "focusin",
        () => {
          held.focus = true;
          update();
        },
      ],
      [
        "focusout",
        () => {
          held.focus = false;
          update();
        },
      ],
    ];
    for (const [name, handler] of events) {
      root.addEventListener(name, handler);
    }
    return () => {
      observer.disconnect();
      for (const [name, handler] of events) {
        root.removeEventListener(name, handler);
      }
      timeline.kill();
    };
  }, [root]);
  return null;
}
