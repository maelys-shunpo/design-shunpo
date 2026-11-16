"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { RefObject } from "react";

import { mounted } from "../lib/mounted.ts";
import { MOUSE, onCookie } from "./cookie-pointer.ts";

gsap.registerPlugin(useGSAP);

/* The pill follows the pointer a beat behind. */
const FOLLOW = 0.25;

/* Moves the pill with the pointer over the cookie; returns what stops it. */
function followPointer(
  target: HTMLElement,
  pill: HTMLElement,
  caption: HTMLElement | never[],
): () => void {
  gsap.set(pill, { xPercent: -50, yPercent: -50 });
  const moveX = gsap.quickTo(pill, "x", { duration: FOLLOW, ease: "power3.out" });
  const moveY = gsap.quickTo(pill, "y", { duration: FOLLOW, ease: "power3.out" });
  let shown = false;
  function show(): void {
    shown = true;
    gsap.to(pill, { autoAlpha: 1, scale: 1, duration: 0.2, ease: "power2.out" });
    gsap.to(caption, { opacity: 0, duration: 0.2, ease: "power2.out" });
    gsap.set(target, { cursor: "none" });
  }
  function hide(): void {
    shown = false;
    gsap.to(pill, { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power2.out" });
    gsap.to(caption, { opacity: 1, duration: 0.2, ease: "power2.out" });
    gsap.set(target, { clearProps: "cursor" });
  }
  function follow(event: PointerEvent): void {
    const box = target.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (!onCookie(x, y, box)) {
      if (shown) {
        hide();
      }
      return;
    }
    if (!shown) {
      gsap.set(pill, { x, y });
      show();
    }
    moveX(x);
    moveY(y);
  }
  target.addEventListener("pointermove", follow);
  target.addEventListener("pointerleave", hide);
  target.addEventListener("pointerdown", hide);
  return () => {
    target.removeEventListener("pointermove", follow);
    target.removeEventListener("pointerleave", hide);
    target.removeEventListener("pointerdown", hide);
    gsap.set(target, { clearProps: "cursor" });
  };
}

/* Over the cookie's button the arrow gives way to a pill that follows the pointer and says what a click does.
   It shows only once the pointer has moved over the cookie itself, so the arrow is never missing; the label
   under the cookie fades meanwhile, one name for one gesture; and it goes when the pointer leaves,
   presses or the cookie opens (the button is then hidden). */
export function useCookieCursor(root: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      const element = mounted(root);
      const button = element.querySelector<HTMLElement>("[data-cookie-part=button]");
      const pill = element.querySelector<HTMLElement>("[data-cookie-part=cursor]");
      const label = element.querySelector<HTMLElement>("[data-cookie-label-text]");
      if (button === null || pill === null) {
        return;
      }
      const target = button;
      const caption = label ?? [];
      const media = gsap.matchMedia();
      media.add(MOUSE, () => {
        return followPointer(target, pill, caption);
      });
    },
    { scope: root },
  );
}
