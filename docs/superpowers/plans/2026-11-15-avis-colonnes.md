# Testimonials drift in two columns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two-by-two testimonial cascade on `/agents` with two columns of testimonials drifting in opposite directions, mirrored against the references band above, with no pause button.

**Architecture:** `Marquee` (already GSAP-driven in a lazy `MarqueeMotion` under `AfterIdle`) gains a card-sized vertical `extent` and an `unfold` reduced-motion mode, and `MarqueeMotion` treats a `TestimonialDrift` as one wall. The new `TestimonialDrift` in `packages/ui/src/agents` splits its cards over two vertical marquees from `lg` and one row below. The app section mirrors the layout with a dense `PageGrid` flow so the copy stays first in the DOM. `TestimonialCascade` and its `agents-landing` utility go.

**Tech Stack:** React 19, Next.js 16, Tailwind v4 (`theme.css` utilities), class-variance-authority, GSAP, Vitest browser mode (`vitest-browser-react`), Storybook, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-avis-colonnes-design.md`

## Global Constraints

- Apps never style: no `className` or `style` in `apps/*`. Every visual lives in `packages/ui`; tokens and utilities only in `packages/ui/src/styles/theme.css`.
- Tests first, in `packages/ui/tests/` (never next to sources). Coverage thresholds stay green (branches 80, rest 90).
- GSAP stays in lazy modules rendered inside `AfterIdle` (`marquee-motion.tsx`); no animation library besides GSAP, no CSS keyframes for the drift.
- Named exports, kebab-case files, early returns, no nested ternaries, no abbreviations. `knip` must find no unused file, export or dependency.
- No pause button. Group label, verbatim: « Avis de clients ».
- Laps: column one 46 s (up), column two 54 s (down); the phone row 60 s (left).
- Testimonials unchanged, word for word, from `apps/web/src/features/shunpo/testimonials.ts`.
- No em dash in any new copy or comment written for this change.

## Review Focus

- An odd number of cards (five, seven): the columns take 3 and 2, nothing dropped. Test in Task 2.
- Reduced motion with a fixed window height: every card whole and readable, no fade, no repeated copy. Tests in Tasks 1 and 2.
- The pointer over one column: both columns hold, both resume when it leaves. Test in Task 2.
- A keyboard visitor: tabbing onto the drift holds it, tabbing away lets it go. Test in Task 2.
- A screen reader: the heading first, then each testimonial once. Tests in Task 2 (each card read once) and Task 3 (copy before cards in the DOM).
- A short window (1280×800): the drift window never taller than the screen less the nav and air. Test in Task 1.

---

### Task 1: `Marquee` sizes to a card window and unfolds under reduced motion

**Files:**

- Modify: `packages/ui/src/agents/marquee.tsx`
- Modify: `packages/ui/src/styles/theme.css` (new `@utility agents-drift-window`, next to `agents-wall-stagger`)
- Create: `packages/ui/tests/agents-marquee.test.tsx`

**Interfaces:**

- Produces: `MarqueeProps.extent?: "tile" | "window"` (default `"tile"`): on `up`/`down`, `tile` keeps `aspect-2/5`, `window` uses `agents-drift-window` (`height: min(42.5rem, 100svh - 13rem)`, its comment saying why: the nav and the section's air stay visible). No effect on `left`/`right`.
- Produces: `MarqueeProps.still?: "clip" | "unfold"` (default `"clip"`): with `unfold`, under `prefers-reduced-motion: reduce` the viewport drops its height, aspect, mask and clip; the repeated copy is not displayed; the track and the copy become a full-width column (`motion-reduce:` variants, no JS). Cva compound variants rather than branches in JSX.

- [ ] **Step 1: Write the failing tests** (`DESKTOP` viewport, `allowMotion` in `afterEach`):

```tsx
it("sizes a vertical marquee to the drift window, never taller than the screen allows", async () => {
  const screen = await render(
    <Marquee direction="up" extent="window">
      <span>Un</span>
    </Marquee>,
  );
  const viewport = screen.container.querySelector<HTMLElement>("[data-slot=marquee]");
  expect(viewport?.classList.contains("aspect-2/5")).toBe(false);
  const height = viewport?.getBoundingClientRect().height ?? 0;
  expect(height).toBeGreaterThan(0);
  expect(height).toBeLessThanOrEqual(Math.min(680, window.innerHeight - 208));
});

it("unfolds every item once under reduced motion", async () => {
  await preferReducedMotion();
  const screen = await render(
    <Marquee direction="up" extent="window" still="unfold">
      <span>Un</span>
      <span>Deux</span>
      <span>Trois</span>
    </Marquee>,
  );
  const viewport = screen.container.querySelector<HTMLElement>("[data-slot=marquee]");
  const copy = screen.container.querySelector<HTMLElement>("[data-slot=marquee] [aria-hidden]");
  expect(getComputedStyle(copy as HTMLElement).display).toBe("none");
  expect(getComputedStyle(viewport as HTMLElement).maskImage).toBe("none");
  expect(viewport?.scrollHeight).toBe(viewport?.clientHeight);
});

it("keeps clipping by default under reduced motion", async () => {
  await preferReducedMotion();
  const screen = await render(
    <Marquee direction="up">
      <span>Un</span>
    </Marquee>,
  );
  const copy = screen.container.querySelector<HTMLElement>("[data-slot=marquee] [aria-hidden]");
  expect(getComputedStyle(copy as HTMLElement).display).not.toBe("none");
});
```

- [ ] **Step 2: Run, expect FAIL**: `pnpm --filter @repo/ui exec vitest run tests/agents-marquee.test.tsx`
- [ ] **Step 3: Implement** the two variants and the utility.
- [ ] **Step 4: Run, expect PASS**, then `pnpm --filter @repo/ui exec vitest run tests/agents-motion.test.tsx` still green.
- [ ] **Step 5: Commit** `feat(ui): a marquee fits a card window and unfolds under reduced motion`

---

### Task 2: `TestimonialDrift`

**Files:**

- Create: `packages/ui/src/agents/testimonial-drift.tsx`
- Modify: `packages/ui/src/agents/marquee-motion.tsx` (the wall: `track.closest("[data-slot=tool-columns], [data-slot=testimonial-drift]")`)
- Create: `packages/ui/tests/agents-testimonial-drift.test.tsx`
- Modify: `packages/ui/stories/agents-testimonials.stories.tsx` (a `Drift` story with six cards and a `play` checking the group by its label; the `Cascade` story stays until Task 3)
- Modify: `packages/ui/AGENTS.md` (add `TestimonialDrift` next to `Testimonial`; `Marquee`'s `extent` and `still`)

**Interfaces:**

- Consumes: `Marquee` with `direction`, `lap`, `extent`, `still` (Task 1).
- Produces: `export function TestimonialDrift(props: { children: ReactNode[]; label: string; laps?: readonly [number, number] }): ReactElement`, `laps` default `[46, 54]`. Root `<div data-slot="testimonial-drift" role="group" aria-label={label} tabIndex={0}>` with a visible focus ring (the tab stop is how a keyboard visitor holds the drift; `tabIndex` removed under reduced motion is not needed, a still group may keep it). From `lg`: a two-column grid (`gap-6`), column one the even-indexed children `direction="up" lap={laps[0]}`, column two the odd-indexed `direction="down" lap={laps[1]}`, both `extent="window" still="unfold"`. Below `lg`: one `Marquee direction="left" lap={60} still="unfold"` of every child, each wrapped at a fixed card width (`w-72`, full width under reduced motion). One layout displayed at a time (`hidden lg:grid` / `lg:hidden`).

- [ ] **Step 1: Write the failing tests** (helpers: `card(author)` returning a `Testimonial`; `visibleAuthors(root)` = names of `[data-slot=testimonial]` that are displayed and not inside `[aria-hidden=true]`; `holdIdleCallbacks` and `transformOf` as in `agents-motion.test.tsx`):

  - `it("splits the cards over two columns from lg, the first, third and fifth in the first")`: DESKTOP, six cards A to F → two displayed `[data-slot=marquee]`; the first's visible authors `["A","C","E"]`, the second's `["B","D","F"]`.
  - `it("keeps every card when the count is odd")`: five cards → `["A","C","E"]` and `["B","D"]`.
  - `it("reads each card once")`: six cards → `visibleAuthors(container)` has length 6.
  - `it("runs one row on a phone")`: `PHONE` viewport → exactly one displayed marquee, holding all six.
  - `it("holds both columns while the pointer is over one")`: DESKTOP, release idle, poll both tracks until they carry a transform; `pointerenter` on the first column's viewport; both transforms unchanged over `SETTLE_MS`; `pointerleave`; poll until both change.
  - `it("holds the drift while it has keyboard focus")`: DESKTOP, release idle, poll until moving; `userEvent.tab()` until `document.activeElement` is the group; both transforms unchanged over `SETTLE_MS`; blur; poll until both change.
  - `it("shows every card whole under reduced motion")`: `preferReducedMotion()`, DESKTOP → the six authors `toBeVisible()`.

- [ ] **Step 2: Run, expect FAIL**: `pnpm --filter @repo/ui exec vitest run tests/agents-testimonial-drift.test.tsx`
- [ ] **Step 3: Implement** `TestimonialDrift`, the wall selector, the story and the AGENTS.md entry.
- [ ] **Step 4: Run, expect PASS**; `pnpm --filter @repo/ui test` green.
- [ ] **Step 5: Commit** `feat(ui): testimonials drift in two columns`

---

### Task 3: The section, mirrored; the cascade removed

**Files:**

- Modify: `packages/ui/src/layout/page-grid.tsx` (variant `flow`: `row` default `""`, `dense` `grid-flow-row-dense`)
- Create: `packages/ui/tests/page-grid.test.tsx`
- Modify: `apps/web/src/features/agents/testimonials-section.tsx`
- Delete: `packages/ui/src/agents/testimonial-cascade.tsx`; the `Cascade` story; the cascade tests in `packages/ui/tests/agents-testimonials.test.tsx` (the `TestimonialCascade` describe and « steps the second card of a pair… »; keep the two `Testimonial` tests); `@utility agents-landing` in `theme.css`
- Modify: `packages/ui/AGENTS.md` (drop `TestimonialCascade`; `PageGrid` `flow`), `DESIGN.md` (« the FAQ answers and the testimonial loop stay minimal » becomes « the FAQ answers stay minimal and the testimonials drift slowly, held under the pointer and on focus »; one line in the decisions log: testimonials drift in two columns, mirrored against the references band, no pause button, chosen 15 November 2026)
- Test: `apps/web/e2e/agents-content.spec.ts`

**Interfaces:**

- Consumes: `TestimonialDrift` (Task 2).
- Produces: `PageGridProps.flow?: "row" | "dense"`.

- [ ] **Step 1: Write the failing tests**
  - `page-grid.test.tsx`: `it("back-fills a row when asked to flow dense")`: `render(<PageGrid flow="dense" />)` → the element's computed `gridAutoFlow` is `"row dense"`.
  - `agents-content.spec.ts`: `test("the testimonials answer the references band from the other side")`: at 1440×900, `/agents`; in `#avis`, the `h2`'s left edge is greater than the `[data-slot=testimonial-drift]`'s right edge, their vertical centres within 200 px; the `h2` precedes the drift in the DOM (`compareDocumentPosition`).
- [ ] **Step 2: Run, expect FAIL**: `pnpm --filter @repo/ui exec vitest run tests/page-grid.test.tsx`; `pnpm --filter @repo/web exec playwright test e2e/agents-content.spec.ts`
- [ ] **Step 3: Implement** `flow`, then the section: `PageGrid rows="xl" align="center" flow="dense"`; copy `GridArea columns={{ lg: { start: 8, span: 5 } }}` first; drift `GridArea columns={{ lg: { start: 1, span: 6 } }}` with `TestimonialDrift label="Avis de clients"` and the six `Testimonial`s with their tones. Remove the `pairs`/`labels` code. Then delete the cascade, its story, its tests, `agents-landing`, and update both docs.
- [ ] **Step 4: Run, expect PASS**, then `pnpm check` (format, lint, types, coverage, knip, ADR gate) green.
- [ ] **Step 5: Commit** `feat(web): testimonials drift beside a mirrored title, the cascade goes`

---

### Task 4: Verify on the page

- [ ] `pnpm test:e2e` green, motion audit included.
- [ ] `pnpm --filter @repo/web lighthouse` passes on mobile and desktop.
- [ ] Screenshots of `#avis` at 1440×900, 390×844 and under reduced motion in `.context/`, checked by eye against prototype B (mirrored).
- [ ] `design-reviewer` agent on `/agents#avis`; fix what it ranks high, re-run `pnpm check`, commit `fix(ui): …` per finding.
