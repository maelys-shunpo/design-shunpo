# Agents cut borders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every border of the Agents direction follows the cut: square corners, one 45° top right cut per top-level object at a depth proportional to it, a folded corner on notes, hairlines instead of boxes inside cut objects, circles kept round.

**Architecture:** One sheet primitive in `packages/ui/src/styles/theme.css` (`agents-sheet` and its modifiers) draws the hairline and the sheet through the same polygon with pseudo-elements, as `agents-card-cut` does today; `--corner-scale: 0` in the Agents block squares every scaled radius at once; components in `packages/ui/src/agents` swap their `rounded-*`/`border`/`shadow-*` classes for the primitive. Tests run in the browser (Vitest browser mode) and assert computed styles.

**Tech Stack:** Tailwind CSS v4 `@utility`, `@property`, CSS `clip-path`, React 19, `class-variance-authority`, Vitest browser + `vitest-browser-react`, Storybook.

**Spec:** `docs/superpowers/specs/2026-11-12-agents-cut-borders-design.md`

## Global Constraints

- Scope: the Agents direction only (`packages/ui/src/agents`, the Agents blocks of `theme.css`, DESIGN.md « Agents »). Other directions untouched.
- Square corners everywhere; `rounded-full` circles (avatars, dots, rings, pause) stay round.
- Cut depths: actions 8 px (10 px on 48 px calls, unchanged, still open/close); halo tool tiles 8 px, 10 px from `md`; bubbles 10 px; nodes and toasts 12 px; nav and paper reference tile 14 px; notes and record card 16 px; cards and windows 20 px; stages 32 px. All built from the spacing scale (theme locked, no arbitrary values).
- Hairline: 1 px `--color-agents-line` (Shiro #E5DFD3) along the cut, only where a border existed; photographs, dark/tinted bubbles and `DocumentSheet` have none.
- Shadows of cut objects are `drop-shadow` filters, never `box-shadow`.
- Fold (notes only): the cut triangle folded inwards, a shade darker than the sheet, never moving on hover. Shades from the chosen mockup: white sheet `#d6ccba → #efe9de`; Kurenai `wait-tint` `#e0c6c2 → #f0dedb`; Tenku `ok-tint` `#c6d6dc → #dde7eb`.
- Bubbles: visitor (right) cut top right, agent and team (left) cut top left.
- No ADR (design choice). No `corner-shape`.
- Golden rules: tests first and in `tests/`, named exports, kebab-case, no dead code (`knip`), no `className`/`style` in `apps/*`.
- **Do not commit.** The working tree carries uncommitted work from the previous session in the same files (`theme.css`, `testimonial.tsx`, `reference-tile.tsx`…); commit only when Maëlys asks.
- Run one test file: `pnpm --filter @repo/ui exec vitest run tests/<file>`.

## Review Focus

1. **A child painting into the cut corner** (a window bar or a tinted header with a background, an image) shows a square corner over the diagonal → such objects use `agents-sheet-clip`, and the test for `PhotoStage` asserts the element itself is clipped (Task 7).
2. **The floating nav switching state** (flat ↔ floating) must not leave a hairline or a cut visible while flat → test both states (Task 7).
3. **Tinted notes keep AA contrast** on their fold and tint → the design audit in `pnpm test:e2e` covers it; run it in Task 8.
4. **Focus on cut objects that are focusable** (`OsWindow` buttons, `TaskComposer` field) shows a square ring, never clipped by a parent's `clip-path` → assert the ring's element is not inside an `agents-sheet-clip` ancestor (Task 3).
5. **Existing cut looks drift** (testimonial, paper reference tile) after the merge → their existing tests stay green unchanged, plus depth assertions (Task 1).

---

## File Structure

- `packages/ui/src/styles/theme.css` — the primitive and its modifiers (Tasks 1–2), `--corner-scale: 0` (Task 2). `agents-card-cut` and `agents-paper-cut` are deleted (Task 1). `agents-cut`, `agents-cut-lg`, `agents-cut-line` stay: they are the action's moving cut and transparent frame. `agents-fold*` stays (the case card's fold, a link).
- `packages/ui/tests/agents-corners.ts` — shared test helpers (Task 1).
- `packages/ui/tests/agents-cut-borders.test.tsx` — one `describe` per task (Tasks 1–7).
- Components in `packages/ui/src/agents/*.tsx` — Tasks 3–7.
- `packages/ui/stories/agents-brand.stories.tsx` — a « Coupe » story (Task 8).
- `DESIGN.md`, `packages/ui/AGENTS.md` — Task 8.

## Primitive API (decided; every task uses these names)

| Utility                                                        | Effect                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agents-sheet`                                                 | `position: relative; isolation: isolate`; `--agents-cut` 20 px (`--spacing-5`); `--agents-sheet-line: var(--color-agents-line)`; `--agents-sheet-fill: var(--color-surface)`; `::before` inset 0 in the line colour, `::after` inset 1 px in the fill colour, both clipped to the top right cut (inner legs + 0.59 px), `z-index: -1`, behind content. Same geometry as today's `agents-card-cut`. |
| `agents-sheet-2xs` / `-xs` / `-sm` / `-md` / `-lg` / `-xl`     | `--agents-cut`: 8 px (10 px from `md`) / 10 / 12 / 14 / 16 / 32 px.                                                                                                                                                                                                                                                                                                                                |
| `agents-sheet-bare`                                            | `--agents-sheet-line: var(--agents-sheet-fill)` (no visible hairline).                                                                                                                                                                                                                                                                                                                             |
| `agents-sheet-wait` / `agents-sheet-ok` / `agents-sheet-night` | Fill and line: `agents-wait-tint` with `agents-wait` at 25 % / `agents-ok-tint` with `agents-ok` at 25 % / Fuji Night (`agents-ink`) both; also set the fold shades.                                                                                                                                                                                                                               |
| `agents-sheet-fold`                                            | Paints the folded triangle as a top right background layer of `::after`, size `--agents-cut` square, `linear-gradient(225deg, transparent 50%, var(--agents-sheet-fold) 50%, var(--agents-sheet-fold-light))`, plus a soft shadow layer under it; defaults to the white-sheet shades. No transition.                                                                                               |
| `agents-sheet-left`                                            | Mirrors both polygons: the cut at the top left.                                                                                                                                                                                                                                                                                                                                                    |
| `agents-sheet-lift`                                            | The card drop shadow (today's `agents-card-cut` filter, verbatim).                                                                                                                                                                                                                                                                                                                                 |
| `agents-sheet-float`                                           | A drop-shadow rendering of `--shadow-agents-float` (three `drop-shadow()` layers, contact + long soft, tuned on screen against the mockup).                                                                                                                                                                                                                                                        |
| `agents-sheet-clip`                                            | Also clips the element itself to the cut (children and backgrounds included). Its shadow, if any, goes on a parent.                                                                                                                                                                                                                                                                                |

New colour tokens (theme `@theme` block, beside `--color-agents-line`): `--color-agents-fold`, `--color-agents-fold-light`, `--color-agents-fold-wait`, `--color-agents-fold-wait-light`, `--color-agents-fold-ok`, `--color-agents-fold-ok-light` with the hexes of Global Constraints.

---

### Task 1: The sheet primitive, replacing `agents-card-cut` and `agents-paper-cut`

**Files:**

- Modify: `packages/ui/src/styles/theme.css` (utilities at ~788–868; add `agents-sheet`, `agents-sheet-md`, `agents-sheet-lift`, `agents-sheet-clip`; delete `agents-card-cut`, `agents-paper-cut`)
- Modify: `packages/ui/src/agents/testimonial.tsx`, `halo-journal.tsx`, `reference-tile.tsx` (paper material)
- Create: `packages/ui/tests/agents-corners.ts`, `packages/ui/tests/agents-cut-borders.test.tsx`

**Interfaces:**

- Produces (helpers in `tests/agents-corners.ts`):
  - `cutOf(element: Element | null): string` — `getComputedStyle(element).getPropertyValue("--agents-cut").trim()`, `""` when null.
  - `roundedElements(container: HTMLElement): Element[]` — elements whose any computed `border-*-radius` is above `0px` and that are not circles (a circle: radius ≥ 9999 px, or radius ≥ half its smaller side).
  - `shadowOf(element: Element): { filter: string; boxShadow: string }`.
- Produces: the `agents-sheet` utilities above (this task: base, `-md`, `-lift`, `-clip`).

- [ ] **Step 1: Write the failing tests** in `agents-cut-borders.test.tsx`, `describe("The sheet")`:
  - `it("cuts a testimonial 20 px deep and lifts it with a drop shadow")`: render `Testimonial` in `<Direction name="agents">`; `expect(cutOf(figure)).toBe("20px")`; `expect(getComputedStyle(figure, "::before").clipPath).toMatch(/^polygon/u)`; `expect(shadowOf(figure).filter).toContain("drop-shadow")`; `expect(figure.className).toContain("agents-sheet")`.
  - `it("cuts a client's paper tile 14 px deep and clips its fibres along the cut")`: `ReferenceTile material="paper"`; `cutOf(tile) === "14px"`; `getComputedStyle(tile).clipPath` matches `/^polygon/u`.
  - `it("cuts the halo journal like a card")`: `cutOf(journal) === "20px"`.
- [ ] **Step 2: Run** `pnpm --filter @repo/ui exec vitest run tests/agents-cut-borders.test.tsx` — expected FAIL (no `agents-sheet` class, no `--agents-cut` on the tile).
- [ ] **Step 3: Implement** the utilities in `theme.css` (geometry copied from `agents-card-cut`; `agents-sheet-clip` copies `agents-paper-cut`'s element clip and its ring `::before`), swap the classes in the three components (`agents-card-cut` → `agents-sheet agents-sheet-lift`; `agents-paper-cut` → `agents-sheet agents-sheet-md agents-sheet-clip`), keep `agents-card-paper` working on `::after`, delete the two old utilities and update their comments.
- [ ] **Step 4: Run** the new file plus `tests/agents-paper-cards.test.tsx tests/agents-testimonials.test.tsx tests/agents-reference-tile.test.tsx` — expected PASS, the three old files unchanged.

### Task 2: Square corners, the remaining modifiers and the fold

**Files:**

- Modify: `packages/ui/src/styles/theme.css` (Agents block `--corner-scale: 2` → `0` at ~428; add `-2xs`, `-xs`, `-sm`, `-lg`, `-xl`, `-bare`, `-wait`, `-ok`, `-night`, `-fold`, `-left`, `-float`, the fold colour tokens)
- Modify: `packages/ui/src/agents/chip.tsx`, `status-pill.tsx`, `text-field.tsx`, `halo-tool.tsx` (the name label pill → square)
- Test: `packages/ui/tests/agents-cut-borders.test.tsx`

**Interfaces:**

- Consumes: Task 1 helpers and base utility.
- Produces: every modifier of the Primitive API table.

- [ ] **Step 1: Write the failing tests**, `describe("Square corners")`:
  - `it("squares chips, statuses and fields, and keeps avatars round")`: render a `Chip`, a `StatusPill`, a `TextField` and an `Avatar` in the Agents direction; `expect(roundedElements(container)).toEqual([])`; the avatar's computed `borderTopLeftRadius` is not `0px`.
  - `it("mirrors the cut to the top left")`: a bare `<div className="agents-sheet agents-sheet-xs agents-sheet-left">` → `getComputedStyle(div, "::before").clipPath` matches `/^polygon\(10px 0px/u`.
  - `it("folds a note's corner in the shade of its paper")`: `<div className="agents-sheet agents-sheet-lg agents-sheet-wait agents-sheet-fold">` → `cutOf` `"16px"`; `getComputedStyle(div, "::after").backgroundImage` contains `linear-gradient` and `rgb(224, 198, 194)`.
  - `it("scales the tile cut from tablets")`: at the default test viewport, `cutOf(<div className="agents-sheet agents-sheet-2xs">)` equals `"8px"` or `"10px"` according to `matchMedia("(width >= 48rem)").matches`.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement** the modifiers and tokens; set `--corner-scale: 0`; remove the now-dead non-full `rounded-*` classes from the four components (the halo name label keeps its look, square).
- [ ] **Step 4: Run** the file and `pnpm --filter @repo/ui test` — expected PASS (no other test asserts a radius).

### Task 3: Windows and cards (cut 20)

**Files:**

- Modify: `packages/ui/src/agents/mock-window.tsx`, `os-window.tsx`, `os-view.tsx`, `hero-semaine-window.tsx`, `hero-convergence-glimpse.tsx`, `document-sheet.tsx`, `tool-tile.tsx`, `reference-tile.tsx` (non-paper), `task-composer.tsx`, `composer-plan.tsx`
- Test: `packages/ui/tests/agents-cut-borders.test.tsx`

**Interfaces:** Consumes `agents-sheet`, `-float`, `-lift`, `-bare`, `-clip`, `-night`, `-xs`; `cutOf`, `roundedElements`, `shadowOf`.

- [ ] **Step 1: Write the failing tests**, `describe("Windows and cards")`:
  - `it("cuts each window 20 px deep, its shadow following the cut")`: for `MockWindow`, `OsWindow`, `HeroSemaineWindow`, `HeroConvergenceGlimpse`, `TaskComposer`, `ToolTile`, `ReferenceTile` (default material): `cutOf(root) === "20px"`, `shadowOf(root).boxShadow === "none"`, `roundedElements(container)` is empty.
  - `it("prints the supplier's document without a hairline")`: `DocumentSheet` → `cutOf === "20px"`; `getComputedStyle(root, "::before").backgroundColor === getComputedStyle(root, "::after").backgroundColor`.
  - `it("lays no box inside a window")`: inside `OsView` and `ComposerPlan` (rendered inside `TaskComposer`), no descendant has a 4-side border (`borderTopWidth`, `borderRightWidth`, `borderBottomWidth`, `borderLeftWidth` all `1px`) other than the composer's chat bubble and the field.
  - `it("keeps the composer's request bubble cut on the visitor's side")`: the request bubble has `agents-sheet-night agents-sheet-xs` and its `::before` clip-path does not start at `10px 0px`.
  - `it("rings focus square, outside any clip")`: the focusable control of `OsWindow` has no `.agents-sheet-clip` ancestor.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement**: windows `agents-sheet agents-sheet-float` (tool tile, reference tile `agents-sheet-lift`); add `agents-sheet-clip` (shadow moved to a wrapper) only where a child paints into the top right corner; `OsView` figure tiles and `ComposerPlan` inner boxes become blocks split by `border-agents-line` hairlines; remove dead `rounded-*`, `border`, `shadow-agents-*` classes.
- [ ] **Step 4: Run** the file and the component tests touching them (`agents-hero-semaine`, `agents-hero-convergence`, `agents-interactive`, `agents-reference-tile`) — expected PASS.

### Task 4: Rows inside windows become hairline lists

**Files:**

- Modify: `packages/ui/src/agents/mail-row.tsx`, `tool-call.tsx`, `field-row.tsx`, `sync-event.tsx`, `hero-semaine-journal.tsx`, `hero-semaine-week.tsx`, `hero-convergence-workspace.tsx`, `hero-couches-layers.tsx` (the agents plane's three cards)
- Test: `packages/ui/tests/agents-cut-borders.test.tsx`

- [ ] **Step 1: Write the failing tests**, `describe("Rows")`:
  - `it("splits rows with hairlines, never boxes")`: for each component above, `roundedElements(container)` is empty and no row element has borders on all four sides.
  - `it("keeps a selected mail lifted, square")`: `MailRow` selected → `boxShadow` not `none`, radii `0px`.
  - `it("keeps tinted rows as square bands")`: the week journal's approval row keeps its tint background and has `borderTopWidth === "0px"`.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement**: drop the per-row border boxes and radii, use `border-b border-agents-line` (or the parent's `divide-y divide-agents-line`), keep tints as square bands, keep the selected mail's shadow on a square band.
- [ ] **Step 4: Run** the file and `agents-hero-semaine`, `agents-hero-convergence`, `agents-hero-couches`, `agents-live` tests — expected PASS.

### Task 5: Notes take the fold

**Files:**

- Modify: `packages/ui/src/agents/toast-note.tsx`, `approval-card.tsx`, `hero-couches-approval.tsx`, `os-decision.tsx`, `email-draft.tsx`
- Test: `packages/ui/tests/agents-cut-borders.test.tsx`

- [ ] **Step 1: Write the failing tests**, `describe("Notes")`:
  - `it("folds a toast 12 px deep")`: `ToastNote` → `cutOf === "12px"`, `::after` `backgroundImage` contains `linear-gradient`, `filter` contains `drop-shadow`.
  - `it("folds a waiting decision on Kurenai paper, then on Tenku once approved")`: `ApprovalCard` and `OsDecision` waiting → `16px`, `::after` `backgroundColor === "rgb(243, 228, 226)"`; the approved state of `HeroCouchesApproval` and of `OsDecision` → `::after` `backgroundColor === "rgb(227, 235, 238)"`, fold present.
  - `it("folds a draft and cuts its send button as an action")`: `EmailDraft` → `16px`, fold present; the send control has `--agents-cut` `8px`.
  - `it("never moves the fold under the pointer")`: `getComputedStyle(toast, "::after").transitionProperty` does not contain `--agents-cut`.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement**: `agents-sheet agents-sheet-sm|-lg agents-sheet-fold agents-sheet-float` (+ `-wait`/`-ok` on decisions); inner logo tiles square; the decisions' Approve/Modify and the draft's send become `agents-cut` actions (8 px, filled / `agents-cut-line`) when they are styled spans, without becoming interactive. The approval ring of `HeroCouchesApproval` (`-inset-1 rounded-xl ring-2`) becomes a square ring.
- [ ] **Step 4: Run** the file and `agents-hero-couches`, `agents-live`, `agents-os-model` tests — expected PASS.

### Task 6: Interface pieces and bubbles

**Files:**

- Modify: `packages/ui/src/agents/workflow-node.tsx`, `record-card.tsx`, `chat-bubble.tsx`
- Test: `packages/ui/tests/agents-cut-borders.test.tsx`

- [ ] **Step 1: Write the failing tests**, `describe("Interface pieces and bubbles")`:
  - `it("cuts workflow nodes 12 px and record cards 16 px, without a fold")`: `cutOf` values; `::after` `backgroundImage === "none"`.
  - `it("cuts each bubble on its speaker's side")`: `ChatBubble` for the visitor → `::before` clip-path does not start at `10px 0px`; for the agent and the team → it does; all `cutOf === "10px"`; the dark and Tenku bubbles have no visible hairline (line colour equals fill).
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement** with `agents-sheet-sm`/`-lg` + `-float`/`-lift`, and in `chat-bubble.tsx`'s `cva` the sheet classes per speaker (`agents-sheet-left` for agent and team, `-night`/`-bare` per tone).
- [ ] **Step 4: Run** the file and `agents-live`, `agents-interactive` tests — expected PASS.

### Task 7: The floating nav, the stages and the halo tiles

**Files:**

- Modify: `packages/ui/src/agents/nav.tsx`, `photo-stage.tsx`, `hero-couches-layers.tsx` (stage planes), `halo-tool.tsx` (tiles)
- Test: `packages/ui/tests/agents-cut-borders.test.tsx`

- [ ] **Step 1: Write the failing tests**, `describe("Nav, stages and tiles")`:
  - `it("cuts the nav 14 px once it floats, and shows nothing while flat")`: in `tests/agents-nav.test.tsx`'s way of forcing the floating state, floating → `cutOf === "14px"`, `::before` opacity `1`; flat → `::before` and `::after` opacity `0`.
  - `it("cuts a photographed stage 32 px and clips the photograph along it")`: `PhotoStage` → `cutOf === "32px"`, the element's own `clipPath` matches `/^polygon/u`, `roundedElements` empty.
  - `it("cuts halo tiles at the action's depth, the empty slot square and dashed")`: a tool tile `cutOf` `8px`/`10px` per `matchMedia("(width >= 48rem)")`; the « your tool » slot while empty: `borderStyle === "dashed"`, `--agents-cut` unset or `0px` behaviour (`::before` `content` is `none`).
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement**: nav floating variant `agents-sheet agents-sheet-md agents-sheet-float`, the pseudo-elements faded with the existing 300 ms transition when flat; stages `agents-sheet-xl agents-sheet-bare agents-sheet-clip` with their shadow on a wrapper; halo tiles `agents-sheet agents-sheet-2xs agents-sheet-lift`, `-float` and a Fushimi `--agents-sheet-line` when on, the empty slot square dashed until it turns solid.
- [ ] **Step 4: Run** the file and `agents-nav`, `agents-tool-halo`, `agents-tool-halo-layout`, `agents-hero-couches` tests — expected PASS.

### Task 8: Stories, docs and full verification

**Files:**

- Modify: `packages/ui/stories/agents-brand.stories.tsx` (a `Coupe` story: every depth, the three papers with their fold, both bubbles, a window with hairline rows)
- Modify: `DESIGN.md` (« Components (chosen on 6 November 2026) »: replace the « Radius » table with a « Coupe » table — role, cut, used by — from Global Constraints; add the rules: one cut per object, hairlines inside, fold for notes, speaker-side bubbles as the one exception, circles stay round, case card's fold unchanged; dated 12 November 2026, Maëlys' choices quoted)
- Modify: `packages/ui/AGENTS.md` (the `agents-sheet` utilities; drop `agents-card-cut`/`agents-paper-cut`)

- [ ] **Step 1:** Write the story and the docs.
- [ ] **Step 2: Run** `pnpm check` — expected PASS (format, lint, types, coverage, knip, ADR gate).
- [ ] **Step 3: Run** `pnpm test:e2e` — expected PASS (design audit at 0 px radii, contrast, motion audit).
- [ ] **Step 4: Run** `pnpm --filter @repo/web lighthouse` — expected PASS on mobile and desktop.
- [ ] **Step 5:** Screenshot `/agents` at 1440 and 390 px into `.context/`, compare with the boards in `.superpowers/brainstorm/24729-1794472270/content/`, then run the `design-reviewer` agent on `/agents` and fix what it raises.
