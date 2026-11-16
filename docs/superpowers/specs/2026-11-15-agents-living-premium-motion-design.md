# Agents page: living, premium motion (keeping the current hero)

Date: 2026-11-15 · Status: approved in conversation (Maëlys, "go comme tes reco")

## Intent and why

The scroll-scrubbed hero film and the hero→problem transition stay as they are (motion-review: PASS). The ask is to make the rest of the page feel **more alive and more premium** without adding more entrance animations. In our motion-review grid, "premium" is where the page has room: life at rest (criterion 5) and matter that answers the pointer with weight and meaning (criterion 6). These proposals raise those, not the entrance count.

## Goals

- The product interfaces look like the agent is **working while you read** (life at rest), the clearest "premium + demonstrative" lever.
- Key figures always **roll** to their value, never snap.
- Paper surfaces answer the pointer with a weighted light (matter responds), where the direction allows it.
- State changes inside mockups **animate** instead of snapping.

## Non-goals / anti-goals (what would make this a failure)

- No new entrance choreography, no per-element sequencing. Motion stays continuous (memory: mouvement continu, pas séquencé).
- No parallax on background photos (competes with the scroll scenes; diagnostic déconseille).
- No hover that scales or tilts a card (breaks the bias cut; diagnostic déconseille).
- No looping/pulsing CTA to grab the eye.
- Nothing that pulls the eye off the copy while reading: ambient motion is slow and pauses off screen, on hover, on focus and under reduced motion.

## Constraints

- Tokens only in `theme.css` / `motion/tokens.ts`; no arbitrary values, no margins, on-scale everything (lint-enforced).
- GSAP/Lenis never on first load; motion lives in lazy modules under `AfterIdle`; entrances/loops go through `enterUnseen` where they are scroll-gated.
- Every ambient loop: paused off screen and under reduced motion, with the existing pause-control pattern (WCAG 2.2.2), as `LiveSurface`, the marquee and the cookie already do.
- Reuse existing primitives: `LiveSurface` / `live-timeline` (ambient replay), `RollingFigure` (counters), the pointer-weight smoothing used by the cookie/wheel, the cut open/close.
- Definition of done per `AGENTS.md`: tests + stories, `pnpm check`, `pnpm test:e2e`, Lighthouse, `motion-review` on signature scenes, `design-reviewer`. Design choices logged in `DESIGN.md`, not an ADR (no new technology).

## Approaches considered

For "more alive + premium" we weighed three routes and dropped two:

- **More/richer entrances** — rejected: it fights the non-goal (the page already has concentrated entrance motion) and would read as a demo reel.
- **Background parallax / ambient WebGL fields** — rejected: competes with the scroll scenes and the hero film, and breaks the paper registry.
- **Life at rest + responsive matter (chosen)** — raises the two grid criteria with the most headroom, stays in the continuous-flow language, and is demonstrative of the product (the agent works).

## The plan, in priority order

**A. Interfaces that work at rest (highest impact).** At rest, the owner's screen (`OsWindow`), and where it fits the calculator/composer, keep working: the agent's journal gains a line every ~4–5 s (a task slides in, a status flips "en cours" → "fait" with the cut opening), a typing dot breathes. A slow ambient loop built on `LiveSurface`/`live-timeline`, paused off screen, on hover, on focus and under reduced motion, with the normed pause control. Cadence slow enough to read copy over it.

**B. Every figure rolls (quick win).** Wrap the calculator result's three Tenku figures (`calculator-result.tsx`: hours/year, cost/year, full-time equivalent) and the CII figure in `RollingFigure`, which already ships and is validated on the case wall. Figures roll on arrival and when their value changes (the slider recompute). Readers hear the figure whole (sr); reduced motion paints it.

**C. Light follows the pointer, on paper.** A soft, weighted sheen (smoothed, slightly behind the pointer) that travels across paper surfaces and stages, the cut catching light. No scale, no tilt. Only where the DA allows, never on photos. Reuses the cookie/wheel pointer-smoothing.

**D. State changes animate, not snap (polish).** Inside mockups, a status flip or sync animates (the cut opens, a check draws) instead of appearing dry.

## Decided how

- New motion tokens for the ambient cadence and the pointer-light smoothing in `motion/tokens.ts` (and `theme.css` for any CSS-driven value), named, migrated from any local constants.
- Each feature: TDD (red→green), story per state with a11y + `play`, unit tests for pure logic, inventory + `DESIGN.md` updated. `Arrival`-style gating reused where relevant.
- B first lands as a fast, near-free premium win and validates the counter everywhere; A is the signature and ships next; C then D.

## Left to the builder

- Exact ambient cadence values and which mockups beyond `OsWindow` get life A (calculator/composer) — pick by what reads calm, log in `DESIGN.md`.
- Whether C is a canvas sheen or a CSS radial that follows a smoothed pointer variable — pick the lighter one that passes the perf budget.
- Per-feature `motion-review` tuning (the loop seam, the roll duration, the pointer lag).
