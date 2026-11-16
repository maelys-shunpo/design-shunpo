---
status: proposed
date: 2026-11-12
decision-makers: [project owner]
---

# 0032. CSS-first entrance for the above-the-fold hero promise

## Context and problem statement

The design system plays title entrances after the page is idle, through `enterUnseen` (GSAP, loaded lazily inside `AfterIdle`), and deliberately leaves any content already painted in the window untouched: a headline in view stays as painted, to protect the LCP and never hide what the visitor already sees (ADR-0011). The « Agents » home hero (ADR-0031) centres the promise — the page's LCP element — above the fold, painted at load. Piste A's approved arrival, « l'aube écrit la promesse », asks that promise to rise word by word out of a still night. How should an above-the-fold LCP title enter without fighting the rule that exists to protect it?

## Decision drivers

- The promise is the LCP; its entrance must neither delay it nor hide it before first paint.
- No flash: a title painted, then yanked back to an offset and re-revealed once GSAP loads, is exactly the failure the `enterUnseen` rule prevents.
- Reduced motion must read the promise complete and still.
- The scroll-driven light and overexposure (temps 2 and 3) stay in GSAP, scrubbed by the scroll, where the design system puts motion.

## Considered options

- Option 1 — A CSS keyframe entrance at first paint. The words rise via `@keyframes agents-rise` with a per-word `animation-delay`, authored in `theme.css`; no JavaScript runs for the arrival.
- Option 2 — Reuse the GSAP `lines` entrance (`HeadlineEntrance` / `enterUnseen`).
- Option 3 — No entrance: leave the painted promise as it is.

## Decision outcome

Chosen option: "Option 1", because it is the only one that plays the approved arrival without touching the LCP. The entrance is pure CSS, runs at first paint before the motion module loads, costs nothing on the critical path, and its reduced-motion and accessible-sentence handling live in markup and `theme.css`. Temps 2 and 3 stay scroll-scrubbed in GSAP (`hero-film-course.ts`). This is an explicit, scoped exception to the `enterUnseen` "painted-in-view-stays-painted" rule (ADR-0011), limited to an above-the-fold LCP title whose entrance can be expressed in CSS keyframes.

Option 2 loses because `enterUnseen` loads after idle: the already-painted LCP title would appear, disappear and reappear, and the LCP could be mis-measured. Option 3 loses because it drops an approved part of the design.

### Consequences

- Good, because the LCP is protected and no JavaScript sits on the critical path for the entrance.
- Good, because reduced motion and the heading's accessible name are settled in markup and CSS, not in a motion module that may never load.
- Bad, because the arrival cannot use GSAP conveniences (SplitText line masking, custom eases); it is limited to what CSS keyframes express — per word, not per measured line.
- Bad, because this is the second named exception to the title rule (after « Notre méthode »); the rule now carries a short list of exceptions to maintain.

## More information

- Relates to ADR-0011 (motion stack: GSAP, Lenis and CSS) and ADR-0031 (scroll-scrubbed video for the « Agents » hero).
- The aesthetic of the arrival — the three temps of piste A and the « surexposition » exit (A1) — lives in `DESIGN.md` and `theme.css`; this ADR records only the mechanism.
- [MDN — `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) and [`animation-delay`](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay).
- Revisit when a future LCP title needs an entrance CSS keyframes cannot express, or when this entrance measurably costs the page its Lighthouse LCP margin on mobile.
