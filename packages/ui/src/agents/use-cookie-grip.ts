"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { RefObject } from "react";

import { mounted } from "../lib/mounted.ts";
import { gripOffset, MOUSE, onCookie } from "./cookie-pointer.ts";

gsap.registerPlugin(useGSAP);

/* The tilt leans toward the pointer a beat behind, so the cookie feels followed, not snapped. */
const FOLLOW = 0.3;
const SETTLE = 0.45;
/* Taken up: it rises a little, grows a touch, and leans in depth toward the point held. */
const LIFT = -10;
const GROW = 1.04;
const TILT_Y = 7;
const TILT_X = 5;
const PERSPECTIVE = 700;

/* Lifts the cookie under a mouse and leans it toward the point held; returns what sets it back down. */
function pickUp(target: HTMLElement, grip: HTMLElement): () => void {
  gsap.set(grip, { transformPerspective: PERSPECTIVE, transformOrigin: "50% 50%" });
  const leanY = gsap.quickTo(grip, "rotationY", { duration: FOLLOW, ease: "power3.out" });
  const leanX = gsap.quickTo(grip, "rotationX", { duration: FOLLOW, ease: "power3.out" });
  let held = false;
  function take(): void {
    held = true;
    gsap.to(grip, { y: LIFT, scale: GROW, duration: SETTLE, ease: "power2.out" });
  }
  function setDown(): void {
    held = false;
    gsap.to(grip, {
      y: 0,
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      duration: SETTLE,
      ease: "power2.out",
    });
  }
  function follow(event: PointerEvent): void {
    const box = target.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (!onCookie(x, y, box)) {
      if (held) {
        setDown();
      }
      return;
    }
    if (!held) {
      take();
    }
    const { nx, ny } = gripOffset(x, y, box);
    leanY(-nx * TILT_Y);
    leanX(ny * TILT_X);
  }
  target.addEventListener("pointermove", follow);
  target.addEventListener("pointerleave", setDown);
  target.addEventListener("pointerdown", setDown);
  target.addEventListener("pointercancel", setDown);
  return () => {
    target.removeEventListener("pointermove", follow);
    target.removeEventListener("pointerleave", setDown);
    target.removeEventListener("pointerdown", setDown);
    target.removeEventListener("pointercancel", setDown);
    gsap.set(grip, { clearProps: "transform" });
  };
}

/* A mouse over the cookie takes it up: it rises, grows a touch and leans toward the held point, then is set back
   down as the pointer leaves, presses or opens it. Mouse only, so touch and reduced motion leave the cookie flat. */
export function useCookieGrip(root: RefObject<HTMLElement | null>): void {
  useGSAP(
    () => {
      const element = mounted(root);
      const button = element.querySelector<HTMLElement>("[data-cookie-part=button]");
      const grip = element.querySelector<HTMLElement>("[data-cookie-part=grip]");
      if (button === null || grip === null) {
        return;
      }
      const media = gsap.matchMedia();
      media.add(MOUSE, () => {
        return pickUp(button, grip);
      });
    },
    { scope: root },
  );
}
