"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { scrub } from "../motion/tokens.ts";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ALLOW_MOTION = "(prefers-reduced-motion: no-preference)";
/* As the sheet covers it, the held landscape recedes to this scale inside its night stage and the Fuji Night veil
   rises this far, deep enough that the hero sets into the same night the problem's sheet rises in, so the seam between
   them fades (« la nuit tombe », 12 November 2026). */
const RECEDE = 0.94;
const DUSK = 0.9;

/* The body's rise over a held hero film. As the sheet climbs over the pinned hero (from its top entering the window to
   its top reaching the window's head), the landscape (the film alone, its night stage held full-bleed so no band of
   the page shows past it) recedes a touch and a Fuji Night veil rises over it, so the page lifts off the sunrise into
   night. Scrubbed by the sheet's own climb; it reads the hero stage and adds the veil at runtime, touching none of the
   hero's own motion, and clears both on teardown. Nothing plays when there is no held hero above (a paper opening) or
   under reduced motion. */
export function CoverSheetMotion(): null {
  useGSAP(() => {
    const sheet = document.querySelector<HTMLElement>("[data-slot='cover-sheet']");
    const stage = document.querySelector<HTMLElement>("[data-hero-film='stage']");
    if (sheet === null || stage === null) {
      return;
    }
    const film = stage.querySelector<HTMLElement>("[data-hero-film='film']");
    const call = document.querySelector<HTMLElement>("[data-hero-film='call']");
    gsap.matchMedia().add(ALLOW_MOTION, () => {
      const veil = document.createElement("div");
      veil.className = "agents-cover-dusk";
      veil.setAttribute("aria-hidden", "true");
      document.body.append(veil);
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: sheet, start: "top bottom", end: "top top", scrub },
      });
      timeline.fromTo(veil, { opacity: 0 }, { opacity: DUSK, ease: "none" }, 0);
      /* The landscape recedes, not its stage: the stage keeps its night full-bleed, so scaling the film back leaves
         night at the edges instead of a band of the page showing past a shrunken stage. */
      if (film !== null) {
        timeline.fromTo(
          film,
          { scale: 1 },
          { scale: RECEDE, transformOrigin: "50% 46%", ease: "none" },
          0,
        );
      }
      /* The promise lifts away first: over the sheet's opening climb it rises, blurs and dissolves into the dusk, clear
         of the paper before it reaches the centre. */
      if (call !== null) {
        timeline.fromTo(
          call,
          { autoAlpha: 1, yPercent: 0, filter: "blur(0px)" },
          { autoAlpha: 0, yPercent: -6, filter: "blur(8px)", ease: "power2.in", duration: 0.2 },
          0,
        );
      }
      return () => {
        timeline.kill();
        if (film !== null) {
          gsap.set(film, { clearProps: "scale,transformOrigin" });
        }
        if (call !== null) {
          gsap.set(call, { clearProps: "opacity,visibility,transform,filter" });
        }
        veil.remove();
      };
    });
  });

  return null;
}
