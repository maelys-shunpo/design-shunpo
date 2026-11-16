---
status: proposed
date: 2026-11-16
decision-makers: [project owner]
---

# 0034. A custom cursor driven by the element under the pointer

## Context and problem statement

Maëlys asked for cursors tailored to the sections or the kind of element, premium but inside the site's world. A custom cursor replaces the operating system's pointer across the whole page, so it is a global interaction pattern others must follow, not a visual choice: it needs an ADR. The question is whether to build one, and how it decides what to draw.

## Decision drivers

- Premium and distinctive, in the direction's world (the coupe, the two-corner frame, « Immobile, puis instantané »), not the generic Awwwards cursor.
- One cursor, not one per section: a different cursor per section would read as a gadget and break « un seul cadrage fort par écran ».
- Never on the critical path: the first paint, touch, reduced motion and a dropped chunk must all keep the system cursor.
- The visitor must keep the native cursor where they read or type, and keyboard focus keeps its own rings.
- Apps never style: the page declares intent, the design system draws.

## Considered options

- No custom cursor: keep the system pointer everywhere.
- A ring that grows on hover with `mix-blend-mode: difference` (the common library look).
- One `Cursor` in `packages/ui` that reads each element's `data-cursor` (or a sensible default) and draws an ink point plus a two-corner travelling frame.

## Decision outcome

Chosen option: the `data-cursor`-driven `Cursor`, because it is the only one that stays in the direction's world and lets each element name what the cursor does without a page styling anything. The blend-mode ring was rejected as the 2021 vocabulary that would read generic beside the coupe and the washi. Doing nothing leaves the premium brief unmet.

The point holds to the pointer with no trail (a 6 px cut square, ink or Kome, never red); the frame jumps to designate on the shift curve with ghosts (`agents-frame-travel`, reused from the question scene). Modes: `point`, `hide` (a cut action or bracketed nav link that answers itself), `shrink` (a ruled link), `designate` (case card, agent tab; not the avis), `scrub` (a held scene, a filling line), `away` (nothing drawn and no system cursor, over a title and the tax credit cookie which has its own pill), `native` (fields and text). The component mounts in `AfterIdle`, runs only under `(hover: hover) and (pointer: fine)`, moves the point with `gsap.quickTo` (transform only), and hides the system cursor only while a point shows. Logic and types are pure in `agents/cursor-model` and unit-tested.

Three forms are built, selectable by the `form` prop and shown in the `Agents/Cursor` Storybook, after Maëlys found the first form's shape off and asked to look at Framer sites, then asked for a square: `coupe` (the hard cut square with the two-corner frame jumping to designate), `satin` (a round dot and a ring trailing on a soft lag, the ring widening over a control), and `carre` (a single square outline trailing the pointer and filling over a control). Satin and carre hug a designated card with a 1 px cut outline, and stay in the charter because a round dot and a square overlay are forms, not angles, like the avatars and pebbles. The page runs `carre` (`<Cursor form="carre" />`, `data-cursor="designate"` on cards and tabs, not the avis); the others are a one-prop change. The ground's scheme is read from the nearest island of either polarity (`data-scheme` or a `scheme-dark` class) so the mark turns Kome over the dark hero. The scrub line over held scenes is not yet wired, and the tax credit cookie keeps its own bespoke « Casser » pill.

### Consequences

- Good, because the whole page gains a signature pointer from one component, and every element opts in through a single `data-cursor` attribute with no styling in the app.
- Good, because it degrades to the system cursor on touch, reduced motion, before idle and on a dropped chunk, so nothing on the critical path depends on it.
- Bad, because hiding the system cursor shifts responsibility for a visible pointer onto JavaScript; the guards (mouse only, after idle, restore on cleanup) must hold, or a visitor could be left without one.
- Bad, because a global `pointermove` handler reads `data-cursor` and a bounding box per move; it stays cheap (transform writes, no layout on the point) but is one more always-on listener.

## More information

- `packages/ui/src/agents/cursor.tsx`, `cursor-motion.tsx`, `cursor-model.ts`; `agents-cursor` in `theme.css`.
- Reuses `motion/travelling-frame` and `lib/frame-jump` from the question scene (ADR context in DESIGN.md « The cursor »).
- Revisit when the cursor is wired into the page and the travel is picked, or if the always-on listener shows up in a motion-review frame-time budget.
