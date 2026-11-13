---
status: proposed
date: 2026-11-13
decision-makers: [project owner]
---

# 0033. A lower branch-coverage threshold for the design system

## Context and problem statement

`packages/ui` enforces a global coverage threshold of 90% on statements, functions, lines and branches (`vite.config.ts`). With the Agents page complete, the unit suite passes (774 tests) and statements, functions and lines sit at ~98%, but **branch** coverage is 85.51%, below the 90% gate, so `pnpm check` fails. The shortfall is concentrated in the motion, scene and choreography modules (`*-choreography.ts`, `headline-entrances.ts`, `fortune-stage.tsx`, `pan-scene.tsx`, `hero-film-motion.tsx`…), which carry two kinds of branch the unit tests do not exercise: defensive guards (`instanceof HTMLElement`, `mounted()` throws, null parts) and motion-path branches (reduced-motion variants, scene fallbacks, scroll states) that only run in a real browser under scroll. How should the gate treat branch coverage of code whose branches are verified by the e2e motion-review rather than unit tests?

## Decision drivers

- The 90% gate should protect the testable logic (parsing, geometry, state, composition), which the suite already covers well.
- A gate that cannot be met without contrived tests for unreachable defensive branches pushes toward fake coverage, not real confidence.
- Motion and scene branches are verified by `pnpm test:e2e` (the motion-review grid) and Lighthouse, not by unit branch coverage.
- The number should keep real headroom below today's 85.51%, so an ordinary change does not break CI, without dropping so far that genuine gaps go unnoticed.

## Considered options

- Option 1 — Lower only the branches threshold to 80%, keeping statements, functions and lines at 90%.
- Option 2 — Write unit tests to cover the missing branches across the motion/scene/choreography code until branches reach 90%.
- Option 3 — Exclude the motion/scene/choreography files from coverage entirely.

## Decision outcome

Chosen option: "Option 1". Mandated by the project owner. The branches threshold in `packages/ui/vite.config.ts` drops to 80; statements, functions and lines stay at 90. The lowered line carries a comment pointing here.

Option 2 loses because many of the uncovered branches are defensive (guards that cannot fire) or motion paths that need a real scrolling browser; covering them with unit tests would be either impossible or theatre. Option 3 loses because it would also drop the statements/functions/lines coverage those files do earn, hiding real regressions in their non-motion logic.

### Consequences

- Good, because `pnpm check` reflects the real quality bar: high coverage on testable logic, motion verified where it can be (e2e, Lighthouse).
- Good, because statements, functions and lines stay gated at 90% across the whole package, motion files included.
- Bad, because a genuine branch gap in non-motion code could now hide under the 80% branches floor; the other three metrics and code review are the backstop.
- Bad, because the two thresholds now differ, which a reader must not mistake for an oversight (hence the comment and this ADR).

## More information

- Relates to the motion stack and lazy-loading rules (ADR-0011) and the e2e motion-review (definition of done).
- [Vitest coverage thresholds](https://vitest.dev/config/#coverage-thresholds).
- Revisit when the motion code becomes unit-testable (a scene test harness), or when non-motion branch coverage alone would clear 90% again.
