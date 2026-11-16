# The 404 page: a crumpled sheet that unfolds — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/not-found` page in the « Agents » direction whose paper sheet arrives crumpled, unfolds to reveal the message, and can be crumpled again (gaining a crease each time), with a flat accessible fallback that never waits on WebGL.

**Architecture:** A pure crumple model in `packages/ui/src/agents` (spring, crease cap, pointer→sheet mapping), a three.js scene in `packages/ui/src/scene` driven through `StageCanvas` and the GSAP ticker, a `Stage` wrapper that posts the crumpled poster and lazy-loads the scene, and a `not-found.tsx` route that composes `<Direction name="agents">`, the Agents nav and a cut sheet carrying the copy. The flat sheet with the copy is the first paint and the reduced-motion / no-WebGL2 fallback; the 3D sheet lays over it once ready.

**Tech Stack:** Next.js 16 (App Router `not-found.tsx`, static export → `404.html`), React, three.js / @react-three/fiber via `StageCanvas`, GSAP (lazy, under `AfterIdle`/`Stage`), Vitest, Playwright, `@repo/design-audit`.

**Spec:** `docs/superpowers/specs/2026-11-16-page-404-papier-froisse-design.md`

## Global Constraints

- Apps never style: no `className`/`style` in `apps/web` (the root layout font variables are the only exception). Compose `@repo/ui`. (AGENTS.md golden rule 1)
- Tokens only in `packages/ui/src/styles/theme.css`; the theme is locked. No arbitrary values, no single-side padding, no off-scale durations/border widths, even inside `@repo/ui`. (golden rule 2)
- Tests first, red→green→refactor. Tests live in `packages/ui/tests/` and `apps/web/e2e/`, never beside sources. Coverage thresholds enforced. (golden rule 3)
- GSAP and three.js never load before first paint: the scene and any `gsap` import live in a lazy module rendered through `Stage` (`renderScene`/`prepareScene`) or `AfterIdle`. A static `gsap`/`three` import in a first-load component costs Lighthouse mobile its LCP margin. (packages/ui/AGENTS.md)
- `StageCanvas` is the only WebGL host: `frameloop="never"`, the GSAP ticker is the one clock, tier pixel ratios from `pixelRatio[tier]`. No standalone `WebGLRenderer` or `requestAnimationFrame` loop. (ADR 0019/0025, known-conflicts in AGENTS.md)
- Every `@repo/ui` component: `cva` variants, `cn()` merge, `data-slot` on root, named export, one per file, kebab-case filename, import path `@repo/ui/<folder>/<file>`.
- Corners: the sheet is cut from `agents-sheet` (one 45° top-right cut, no radius); the call uses `agents-cut`. Inside a cut object, hairlines, never boxes. (DESIGN.md « Coupe »)
- Copy is French, « Agents » voice (`shunpo-voix`), no em/en dash as punctuation. Exact strings in Task 2.
- No new dependency, technology or pattern → no ADR. React Bits code is not copied (MIT + Commons Clause); the technique is reimplemented, with a credit comment.
- The 404 is not a typed `Route`: it is NOT added to `apps/web/e2e/support/routes.ts`. Its audits run from a dedicated spec against an explicit unknown URL `/cette-page-n-existe-pas`.

## Review Focus

- **Pointer released outside the sheet, or a touch that scrolls:** a press that leaves the sheet, or a drag the browser turns into a scroll, must settle the sheet open and never leave it stuck mid-crumple. Covered in Task 1 (`pointerToSheetUv` null outside) and Task 4 (story: pointerup outside → settles open).
- **The scene never becomes ready (slow phone, failed compile):** the message must be readable within 1.5 s of first paint regardless. Covered in Task 4 (the flat-sheet safety timeout) and Task 2 (the fallback IS the first paint, so the message never depends on the scene).
- **Reduced motion toggled while the page is open:** the canvas must drop to the flat sheet and the game must stop. `Stage`'s `usePosterFallback` already listens for the `prefers-reduced-motion` change; Task 4 asserts the controller stops crumpling once the poster has fallen back.
- **A crumple held past the cap:** crumpling more than 5 times must not keep deepening the paper or overflow the crease list. Covered in Task 1 (`addCrumple` caps at `MAX_CRUMPLES`).
- **Keyboard-only and screen-reader visitor:** the game is decorative; focus must reach the call and the nav directly, and the canvas must be `aria-hidden` with the accessible name on the poster. Covered in Task 2 (axe + keyboard e2e) and Task 4 (canvas `aria-hidden`).

---

### Task 1: The crumple model (pure functions)

**Files:**

- Create: `packages/ui/src/agents/paper-crumple-model.ts`
- Test: `packages/ui/tests/agents-paper-crumple-model.test.ts`

**Interfaces:**

- Produces:
  - `MAX_CRUMPLES = 5` (const).
  - `type Crease = { u: number; v: number; angle: number; depth: number }` — a fold line seeded in sheet space.
  - `type CrumpleState = { count: number; creases: readonly Crease[] }`.
  - `stepSpring(current: number, velocity: number, target: number, stiffness: number, damping: number, dt: number): { value: number; velocity: number }` — a damped spring integration step.
  - `addCrumple(state: CrumpleState, at: { u: number; v: number }, seed: number): CrumpleState` — adds one crumple's creases around `at`, incrementing `count` up to `MAX_CRUMPLES`; at the cap it returns the state unchanged (same `count`, no new creases).
  - `pointerToSheetUv(pointer: { x: number; y: number }, rect: { left: number; top: number; width: number; height: number }): { u: number; v: number } | null` — maps a client point to sheet UV in `[0,1]`, or `null` when the point is outside `rect`.

- [ ] **Step 1: Write the failing tests**

```ts
// agents-paper-crumple-model.test.ts
describe("stepSpring", () => {
  it("moves toward the target and settles there", () => {
    let s = { value: 0, velocity: 0 };
    for (let i = 0; i < 600; i++) s = stepSpring(s.value, s.velocity, 1, 120, 18, 1 / 60);
    expect(s.value).toBeCloseTo(1, 2);
    expect(s.velocity).toBeCloseTo(0, 2);
  });
  it("stays put when already at the target with no velocity", () => {
    const s = stepSpring(1, 0, 1, 120, 18, 1 / 60);
    expect(s.value).toBeCloseTo(1, 5);
    expect(s.velocity).toBeCloseTo(0, 5);
  });
});

describe("addCrumple", () => {
  it("adds creases and counts up", () => {
    const next = addCrumple({ count: 0, creases: [] }, { u: 0.5, v: 0.5 }, 1);
    expect(next.count).toBe(1);
    expect(next.creases.length).toBeGreaterThan(0);
  });
  it("is deterministic for a seed", () => {
    const a = addCrumple({ count: 0, creases: [] }, { u: 0.4, v: 0.6 }, 7);
    const b = addCrumple({ count: 0, creases: [] }, { u: 0.4, v: 0.6 }, 7);
    expect(a.creases).toEqual(b.creases);
  });
  it("stops at MAX_CRUMPLES and keeps the crease list bounded", () => {
    let s: CrumpleState = { count: 0, creases: [] };
    for (let i = 0; i < 20; i++) s = addCrumple(s, { u: 0.5, v: 0.5 }, i);
    expect(s.count).toBe(MAX_CRUMPLES);
    const capped = addCrumple(s, { u: 0.5, v: 0.5 }, 99);
    expect(capped).toBe(s);
  });
});

describe("pointerToSheetUv", () => {
  const rect = { left: 100, top: 50, width: 200, height: 400 };
  it("maps a point inside to UV in [0,1]", () => {
    expect(pointerToSheetUv({ x: 200, y: 250 }, rect)).toEqual({ u: 0.5, v: 0.5 });
  });
  it("is null outside the sheet", () => {
    expect(pointerToSheetUv({ x: 50, y: 250 }, rect)).toBeNull();
    expect(pointerToSheetUv({ x: 200, y: 500 }, rect)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail** — `pnpm --filter @repo/ui exec vitest run tests/agents-paper-crumple-model.test.ts` → FAIL (module/exports missing).
- [ ] **Step 3: Implement `paper-crumple-model.ts`** with the signatures above. `stepSpring` is a semi-implicit damped-spring step. `addCrumple` seeds its creases with a small deterministic PRNG from `seed`. No three.js import here (pure numbers only).
- [ ] **Step 4: Run the tests, verify they pass.**
- [ ] **Step 5: Commit** — `feat(ui): crumple model for the 404 paper sheet`.

---

### Task 2: The 404 route, static sheet and copy (the fallback)

This task ships a complete, accessible 404 with the right look and copy, with a flat cut sheet (no 3D yet). It is the reduced-motion / no-WebGL2 fallback and the first paint of the final page.

**Files:**

- Create: `apps/web/src/app/not-found.tsx` (route + `metadata`)
- Create: `apps/web/src/features/not-found/not-found-page.tsx` (composition)
- Create: `apps/web/src/features/not-found/not-found-copy.tsx` (the sheet's title, sentence and call)
- Create: `apps/web/e2e/not-found.spec.ts` (first assertions; grows in Tasks 4–5)
- Reference: `apps/web/src/features/agents/page-nav.tsx` (reused), `apps/web/src/features/agents/agents-page.tsx` (shell pattern)

**Interfaces:**

- Consumes: `@repo/ui` layout/typography (`Section`, `GridArea`/`PageGrid` or `Container`, `Stack`), `Headline`/`HeadlinePart`, `AgentsAction`, `Direction`, and the Agents `PageNav`.
- Produces: `NotFoundPage` (default-exported indirectly through `not-found.tsx`); a stable DOM the later tasks lay the stage over (a `data-slot="not-found-sheet"` element carrying the copy).

- [ ] **Step 1: Write the failing e2e test**

```ts
// not-found.spec.ts
test("an unknown address shows the crumpled-sheet 404 with the way home", async ({ page }) => {
  const response = await page.goto("/cette-page-n-existe-pas");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Cette page n’existe pas." }),
  ).toBeVisible();
  await expect(
    page.getByText("Le lien est peut-être ancien, ou l’adresse contient une faute de frappe."),
  ).toBeVisible();
  const home = page.getByRole("link", { name: "Revenir à l’accueil" });
  await expect(home).toHaveAttribute("href", /\/$/);
  await expect(page.locator("title")).toHaveText("Page introuvable");
});
```

- [ ] **Step 2: Run it, verify it fails** — `pnpm --filter @repo/web exec playwright test e2e/not-found.spec.ts` → FAIL (default Next 404 has none of this). Requires a prior `pnpm --filter @repo/web build`.
- [ ] **Step 3: Build the page.**
  - `not-found-copy.tsx`: exports the exact strings — title `"Cette page"` (dim) + `"n’existe pas."` (ink) as `Headline`/`HeadlinePart` rendered as `h1`; sentence `"Le lien est peut-être ancien, ou l’adresse contient une faute de frappe."`; call `"Revenir à l’accueil"` as `AgentsAction` (filled, size `lg`/48, trailing arrow) with `render={<Link href="/" />}`.
  - `not-found-page.tsx`: `<Direction name="agents">` wrapping the Agents `PageNav` (`over="paper"`), then a `Section height="screen"` holding one centred cut sheet (`agents-sheet-lg` paper, `data-slot="not-found-sheet"`) that contains the copy. No footer, no `CoverSheet`. Follow `agents-page.tsx` for the shell; decide `Cursor`/`PaperGate` inclusion by what a one-screen page needs (the sheet is the only focus) — builder's call, default to including `Cursor` for consistency, omitting `PaperGate`.
  - `not-found.tsx`: `export const metadata: Metadata = { title: "Page introuvable" }` (Next injects `noindex` for the 404 automatically; do not set it by hand), `export default function NotFound() { return <NotFoundPage />; }`. Read `apps/web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` first: the root `not-found.tsx` catches all unmatched URLs and renders inside the root layout (fonts + providers inherited).
- [ ] **Step 4: Run the e2e, verify it passes** (rebuild first).
- [ ] **Step 5: Extend the spec with the design-audit and keyboard checks**, reusing `@repo/design-audit` the way `apps/web/e2e/design-audit.spec.ts` does, but for the single URL `/cette-page-n-existe-pas` in both colour schemes under reduced motion:

```ts
test.describe("the 404 holds the design system", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test.use({ colorScheme, contextOptions: { reducedMotion: "reduce" } });
    test(`${colorScheme}: WCAG 2.2 AA, tokens, no horizontal scroll`, async ({ page }) => {
      await page.goto("/cette-page-n-existe-pas");
      // axe with the WCAG tags and the PLAIN_PAPER style tag as in design-audit.spec.ts
      // collectTokenScales / findDesignViolations as in design-audit.spec.ts
      // scrollWidth - clientWidth === 0
    });
  }
  test("the keyboard reaches the way home", async ({ page }) => {
    await page.goto("/cette-page-n-existe-pas");
    await page.keyboard.press("Tab");
    // the home call is reachable without passing through the canvas
  });
});
```

- [ ] **Step 6: Run the full spec, verify green. Commit** — `feat(web): 404 page with the Agents cut sheet and copy`.

---

### Task 3: The crumple scene in `StageCanvas`

The 3D sheet: a subdivided plane displaced in the vertex shader, lit as an Agents paper, posed each frame from a `sheet` driver object.

**Files:**

- Create: `packages/ui/src/scene/paper-crumple-geometry.ts` (subdivided plane + crease→uniform packing)
- Create: `packages/ui/src/scene/paper-crumple-shaders.ts` (the vertex displacement GLSL injected via `onBeforeCompile`)
- Create: `packages/ui/src/scene/paper-crumple-world.ts` (`createPaperCrumpleWorld` / `disposePaperCrumpleWorld`)
- Create: `packages/ui/src/scene/use-paper-crumple-world.ts` (hook over `useSceneResource`)
- Create: `packages/ui/src/scene/paper-crumple-pose.ts` (`posePaperCrumple`, pure stepping of uniforms from the driver)
- Create: `packages/ui/src/scene/paper-crumple-scene.tsx` (`PaperCrumpleScene`, `StageCanvas` + frame)
- Test: `packages/ui/tests/scene-paper-crumple-geometry.test.ts`
- Reference: `packages/ui/src/scene/coupe-scene.tsx`, `use-coupe-world.ts`, `coupe-sheet.ts`, `stage-canvas.tsx`, `use-first-frame.ts`

**Interfaces:**

- Consumes: `Crease`, `MAX_CRUMPLES`, `stepSpring` from Task 1; `SceneProps` (`{ tier, onReady }`) from `motion/stage.tsx`; `StageCanvas`, `useFirstFrame`, `useSceneResource`.
- Produces:
  - `type PaperSheet = { crumple: number; creases: readonly Crease[]; pointer: { u: number; v: number } | null }` — the stable driver object the stage mutates and the scene reads (the `progress`-object pattern of the other stages).
  - `interface PaperCrumpleSceneProps extends SceneProps { sheet: PaperSheet }`.
  - `PaperCrumpleScene(props: PaperCrumpleSceneProps): ReactElement`.
  - `buildCrumpleGeometry(tier: QualityTier): { positions: Float32Array; segments: number }` (or a `THREE.PlaneGeometry` — builder's call; the test asserts the subdivision count scales with tier).

- [ ] **Step 1: Write the failing geometry test** (pure, no GPU — mirror `agents-fortune-geometry.test.ts`):

```ts
// scene-paper-crumple-geometry.test.ts
it("subdivides the plane and gives more segments on higher tiers", () => {
  const light = buildCrumpleGeometry("light");
  const full = buildCrumpleGeometry("full");
  expect(full.segments).toBeGreaterThan(light.segments);
  expect(light.segments).toBeGreaterThanOrEqual(1);
});
it("packs creases up to the cap into the shader uniform array without overflow", () => {
  const packed = packCreases(
    Array.from({ length: 50 }, () => ({ u: 0.5, v: 0.5, angle: 0, depth: 1 })),
  );
  expect(packed.length).toBe(CREASE_UNIFORM_SLOTS); // fixed-size, ≥ what MAX_CRUMPLES produces
});
```

- [ ] **Step 2: Run it, verify it fails** — `pnpm --filter @repo/ui exec vitest run tests/scene-paper-crumple-geometry.test.ts`.
- [ ] **Step 3: Implement the geometry + crease packing** in `paper-crumple-geometry.ts` (define `CREASE_UNIFORM_SLOTS`, `packCreases`). Tune subdivision against the paper references in `.context/papier/` — a reasonable default per tier; the test only pins the ordering and the bound.
- [ ] **Step 4: Run it, verify it passes.**
- [ ] **Step 5: Implement the rest of the scene** (no new unit test; proven by the story in Task 4 and the motion audit in Task 5):
  - `paper-crumple-shaders.ts`: a GLSL chunk added through `material.onBeforeCompile` that displaces each vertex by the summed influence of the crease uniforms and a global `uCrumple` amount, and perturbs the normal for lighting. Credit comment: reimplemented from React Bits `PaperCrumple` (MIT + Commons Clause), not copied.
  - `paper-crumple-world.ts`: a `MeshStandardMaterial` paper (matte, fine grain, no gloss) on the subdivided plane, a soft key light from top-left and a contact shadow, uniforms for `uCrumple` and the packed creases; `create`/`dispose` like `coupe-world.ts`.
  - `use-paper-crumple-world.ts`: `useSceneResource(createPaperCrumpleWorld, disposePaperCrumpleWorld, canvas, tier)`.
  - `paper-crumple-pose.ts`: `posePaperCrumple(world, { delta, sheet })` writes `uCrumple` and the packed creases into the material uniforms (no React state writes — module function, like `poseCoupe`).
  - `paper-crumple-scene.tsx`: `StageCanvas` (`tier`, `className="absolute inset-0"`, transparent, `style={{ pointerEvents: "none" }}` so the DOM call stays clickable, a camera framing the sheet like `coupe-scene.tsx`), a frame component calling `useFirstFrame(onReady)` and `useFrame` → `posePaperCrumple`. `shadows` only on `full`.
- [ ] **Step 6: Run `pnpm --filter @repo/ui check` (types, lint) and `vitest`, verify green. Commit** — `feat(ui): paper-crumple scene for StageCanvas`.

---

### Task 4: The stage, the interaction and wiring into the 404

The `Stage` wrapper (poster + lazy scene), the arrival-unfold and press-to-crumple interaction, and the swap into the 404 page over the flat sheet.

**Files:**

- Create: `packages/ui/src/motion/paper-crumple-stage.tsx` (`PaperCrumpleStage`)
- Create: `packages/ui/src/motion/paper-crumple-interaction.ts` (lazy: GSAP spring + pointer listeners driving the `PaperSheet`; imported only by the lazy scene module)
- Create: `packages/ui/src/stories/paper-crumple-stage.stories.tsx`
- Modify: `packages/ui/src/scene/paper-crumple-scene.tsx` (mount the interaction, expose arrival/crumpling callbacks)
- Modify: `apps/web/src/features/not-found/not-found-page.tsx` (lay the stage over the sheet; fade the copy while crumpling)
- Create: posters `packages/ui/src/motion/images/paper-crumple-ball.avif` and `…-flat.avif` (captured from the scene; see `.context` capture scripts e.g. `.context/shoot.mjs`)
- Reference: `packages/ui/src/motion/coupe-stage.tsx`, `agents-shuriken-stage.tsx`

**Interfaces:**

- Consumes: `PaperCrumpleScene`, `PaperSheet` (Task 3); `Stage`, `SceneProps`; the model (Task 1).
- Produces:
  - `interface PaperCrumpleStageProps { poster: ReactElement; flatPoster: ReactElement; onArrived?: () => void; onCrumplingChange?: (crumpling: boolean) => void }`.
  - `PaperCrumpleStage(props): ReactElement` — a `Stage` whose `poster` is the crumpled ball, `posterExit="cut"`, `prepareScene` the scene import, `renderScene` the lazy scene; it owns the stable `PaperSheet` and starts the unfold on `onReady`.

- [ ] **Step 1: Write the failing story** (`stories/paper-crumple-stage.stories.tsx`, a play + a11y test like other stories):
  - `play` asserts the canvas host carries `aria-hidden="true"` and the poster carries the accessible name.
  - A second story under `prefers-reduced-motion` asserts the flat poster shows and no canvas mounts.
  - (Pointer-crumple behaviour is asserted in the e2e in Step 5, where a real browser and WebGL exist.)
- [ ] **Step 2: Run the stories, verify they fail** — `pnpm --filter @repo/ui exec vitest run` (storybook test project) → FAIL (components missing).
- [ ] **Step 3: Implement the stage + interaction.**
  - `paper-crumple-interaction.ts` (lazy, imports `gsap`): attaches `pointerdown`/`move`/`up` on the sheet rect, maps through `pointerToSheetUv`, drives `sheet.crumple` with a GSAP spring toward 1 while held and back to 0 on release, calls `addCrumple` on release (capped), fires `onCrumplingChange(true)` at the first movement and `(false)` once settled; `touch-action: none` on the sheet only. On the arrival, tween `crumple` 1→0 over ~1.2 s on the shift ease, keeping the seeded arrival creases.
  - `paper-crumple-stage.tsx`: wire `Stage` as `coupe-stage.tsx` does; create the stable `PaperSheet`; on `onReady` run the arrival; pass `onCrumplingChange` up.
- [ ] **Step 4: Run the stories, verify they pass.**
- [ ] **Step 5: Wire into the 404 and add the arrival e2e.**
  - In `not-found-page.tsx`, lay `PaperCrumpleStage` over the `data-slot="not-found-sheet"` element; keep the HTML copy in the DOM, fading it via a client leaf that reads `onCrumplingChange` (a small `"use client"` wrapper; the fade is a token opacity transition, no `className` in `apps/web` — use a `@repo/ui` primitive that carries the fade, add one if none fits). The flat sheet of Task 2 stays as the poster/fallback so first paint and reduced motion are unchanged.
  - Extend `not-found.spec.ts`:

```ts
test("the sheet unfolds on arrival and the message stays readable", async ({ page }) => {
  await page.goto("/cette-page-n-existe-pas"); // motion allowed (default)
  // the h1 is visible within 1.5s whether or not the scene ever goes live
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 1500 });
  // the canvas host, once present, is aria-hidden
  await expect(page.locator("[data-slot='not-found-sheet'] canvas")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});
```

- [ ] **Step 6: Run the e2e (rebuild first), verify green. Commit** — `feat: lay the crumpling sheet over the 404 and unfold it on arrival`.

---

### Task 5: Audits, posters, docs and the enterUnseen exception

**Files:**

- Modify: `apps/web/lighthouserc.json` and `apps/web/lighthouserc.desktop.json` (add the 404 URL with 404-appropriate assertions)
- Modify: `apps/web/e2e/not-found.spec.ts` (a motion check for the sheet stage)
- Modify: `DESIGN.md` (the 404 direction + the deliberate `enterUnseen` exception)
- Modify: `packages/ui/AGENTS.md` (inventory rows for `PaperCrumpleStage` and the sheet)
- Reference: `apps/web/e2e/motion-audit.spec.ts`, `@repo/design-audit/motion`

**Interfaces:** none produced; this task closes the Definition of Done.

- [ ] **Step 1: Resolve the Lighthouse-on-a-404 conflict (my call, see handoff note).** A 404 is `noindex` by design, so the SEO « is-crawlable » audit cannot score 1. Add `http://localhost:3200/cette-page-n-existe-pas` to both `url` lists, and give that URL its own assertions (LHCI per-URL override / a second `ci.assert` matrix entry): assert `categories:performance ≥ 0.95` and `categories:accessibility = 1` and `categories:best-practices = 1`, but do NOT assert `categories:seo` for it. Leave the other routes' assertions unchanged.
- [ ] **Step 2: Run Lighthouse, verify the 404 passes its budgets** — `pnpm --filter @repo/web lighthouse` (mobile then desktop). Expected: performance ≥ 0.95, accessibility 1, best-practices 1 on the 404 URL.
- [ ] **Step 3: Add the motion check** to `not-found.spec.ts`: after an interaction (a pointer press that wakes the scene), the sheet canvas is neither blank nor frozen and logs no WebGL/shader error, using the `findBlankCanvases`/`findFrozenCanvases`/`findRenderErrors` helpers as `motion-audit.spec.ts` does. Under reduced motion, no canvas is present.
- [ ] **Step 4: Document.**
  - `DESIGN.md`: a short « Page 404 » note under the Agents direction — the crumpled sheet that unfolds, the copy, and the deliberate exception to `enterUnseen` (here the ball IS the content, so the arrival may replace it; the message has a 1.5 s flat-sheet safety).
  - `packages/ui/AGENTS.md`: inventory rows for `motion/paper-crumple-stage` `PaperCrumpleStage` (poster, flatPoster, callbacks · the 404's unfolding sheet) and any new sheet/fade primitive. Note the stage is a canvas host → no Code Connect template.
- [ ] **Step 5: Full gate.** Run `pnpm check`, `pnpm --filter @repo/web test:e2e` (design + motion audits, 404 spec included), and `pnpm --filter @repo/web lighthouse`. Then `motion-review` on the arrival and the game, then the `design-reviewer` agent on `/cette-page-n-existe-pas`. Fix anything they raise.
- [ ] **Step 6: Commit** — `docs: record the 404 crumpled-sheet page and its audits`.

---

## Self-Review notes

- **Spec coverage:** route + export (T2, Next docs read); Agents look + nav + one screen + no footer (T2); copy (T2, exact strings); sheet + cut corner (T2/T3); arrival ball→unfold + 1.5 s safety (T4 + T2 fallback); press-to-crumple + creases capped at 5 (T1 model, T4 interaction); mouse/pen/touch + `touch-action` (T4); canvas `aria-hidden`, keyboard to the call (T2/T4); reduced motion & no-WebGL2 fallback (T2 is the fallback, Stage handles the switch, T4/T5 assert it); lazy load / performance (T3/T4 through `Stage`, T5 Lighthouse); no React-Bits copy, no ADR (constraints); audits + routes.ts exclusion (T5).
- **Two decisions I made (spec said "others at 1"):** (1) Lighthouse SEO is not asserted on the 404 because `noindex` is correct for it; performance/accessibility/best-practices still are. (2) The 404 is kept out of `routes.ts` and audited from its own spec, because `routes.ts` is typed `Route[]` and an unknown URL is not a route. Both are flagged for review.
- **Proportion:** bodies are left to the builder (shader, world, interaction); the plan pins signatures, the model's exact behaviour, the copy strings and the tests. Pattern references (`coupe-*`, `shuriken-*`, `design-audit.spec.ts`, `motion-audit.spec.ts`) carry the idiom.
