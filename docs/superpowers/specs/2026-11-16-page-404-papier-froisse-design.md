# The 404 page: a crumpled sheet that unfolds

Date: 16 November 2026. Chosen by Maëlys in conversation: the place (the 404 page, over a refused approval, the four pains and the calculator), the scenario (C: the sheet arrives as a ball and unfolds, and the visitor can crumple it again) and the build (a real 3D sheet in `StageCanvas`).

## Intent

Maëlys sent React Bits' `PaperCrumple` (reactbits.dev/micro/paper-crumple) as a library that could help polish the site. Its gesture means « thrown away », and the one place where a thrown-away page tells the truth is the page that does not exist. Today an unknown address falls on Next.js's default 404, outside every direction. The page should say plainly that the page does not exist, give the way back at once, and reward the visitor who plays with the paper.

## Approaches

### Scenario

| Scenario                                                                                       | Trade-off                                                    | Verdict          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------- |
| A. The page arrives as a ball and unfolds, keeping its creases; the message is on the sheet    | Read almost at once; the creases left are very washi         | Not chosen alone |
| B. A flat sheet the visitor crumples (press and hold) and throws away                          | Playful, but most visitors never find it                     | Not chosen alone |
| **C. A, then B: it unfolds on arrival, and can be crumpled again, gaining a crease each time** | The message needs no action; the game is a bonus for finders | **Chosen**       |

### Build

| Build                                                                                             | Trade-off                                                                                      | Verdict    |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------- |
| **1. A real 3D sheet in `StageCanvas`, the crumple in a vertex shader, the GSAP ticker as clock** | The most work; the only one that answers the pointer and keeps each crumple's creases          | **Chosen** |
| 2. A filmed sequence (Magnific footage played frame by frame)                                     | Very real and light, but re-crumpling is the film backwards: same creases, no pointer; credits | Not chosen |
| 3. A faked fold in SVG facets animated by GSAP                                                    | Light and quick, never reads as a paper ball                                                   | Not chosen |

React Bits' component is not copied: it builds its own `WebGLRenderer` and `requestAnimationFrame` loop, styles with `className`/CSS files, and is licensed MIT + Commons Clause. The sheet is written from scratch in `packages/ui`, taking the technique (a subdivided plane displaced in the vertex shader through `onBeforeCompile`, spring-driven crumple amount, creases that remain after release), with a credit comment.

## Goals

- **Route.** `apps/web/src/app/not-found.tsx` (Next.js 16: read `apps/web/node_modules/next/dist/docs/` on `not-found` first). The static export writes it as `404.html`, which GitHub Pages serves for any unknown address.
- **Direction « Agents ».** Warm paper ground, the Agents bar on top (`PageNav`, as on `/agents`), no footer. One screen tall on every width from 390 px; nothing to scroll.
- **Copy** (`shunpo-voix`, to be confirmed by Maëlys):
  - Title, `Headline` with `HeadlinePart`: « Cette page » (dim) « n’existe pas. » (ink). An `h1`.
  - One sentence: « Le lien est peut-être ancien, ou l’adresse contient une faute de frappe. »
  - One call: « Revenir à l’accueil » (`Action`, filled, 48 px, trailing arrow), to `/`.
  - Page title: « Page introuvable », `robots: noindex`.
- **The sheet.** A white note paper (`agents-sheet` paper and its 45° cut at the top right, 16 px in proportion), portrait, centred, carrying the title, the sentence and the call. Its size follows the layout grid (about 6 columns from `lg`, the full content width below `md`).
- **Arrival.** The first paint shows the ball: a still poster of the crumpled sheet, centred. When the scene is ready its first frame matches that poster, and the sheet unfolds in about 1.2 s on the shift ease family, keeping its creases. The HTML message, laid exactly over the flat sheet, appears as the sheet lands flat. Safety: if the scene fails or is not ready 1.5 s after the first paint, the poster swaps to the flat sheet and the message shows at once. This is a deliberate exception to `enterUnseen` (content in view is never hidden by motion): here the ball is the content; it is written in `DESIGN.md` as such.
- **Playing.** Press and hold on the sheet crumples it towards the point pressed (the HTML message fades out at the first movement); releasing unfolds it again with the new creases added to the old ones. Creases accumulate up to 5 crumples, then the paper stays at that wear. Mouse, pen and touch; `touch-action: none` on the sheet only. The game is decorative: the canvas is `aria-hidden`, the keyboard goes straight to the call and the bar.
- **Paper look.** Lit like the other Agents papers (soft key light from the top left, drop shadow following the sheet onto the ground), a fine paper grain, creases visible by light only. No colour beyond the paper, the ink and the call.
- **Reduced motion.** The flat sheet with a few creases (still poster), the message painted, no canvas, no game.
- **No WebGL2, or a low tier that cannot hold it.** Same as reduced motion.
- **Performance.** three.js, the React renderer and the scene load lazily inside `AfterIdle` through `Stage` (`renderScene`, `prepareScene`); the first paint is the poster and HTML only. The canvas draws only while something moves (arrival, press, release) and sleeps otherwise.

## Non-goals

- No 404 variants per direction (`/instant`, `/fil`…): one 404 for the whole site.
- No search field, no list of links, no illustration beyond the sheet.
- No throw of the ball off screen, no bin, no sound.
- `PaperCrumple` is not made a general component for other pages now; if it is reused later (a refused approval, Maëlys's other idea), it is generalised then.

## Anti-goals

- The message must never wait on WebGL to be readable: a slow phone sees the flat sheet and the words within 1.5 s at worst.
- The paper must not read as a 3D demo: no glossy material, no camera move, no rotation of the sheet beyond what the crumple gives.
- No layout shift when the HTML message appears over the sheet.

## Constraints

- Golden rules: no `className`/`style` in `apps/web`; tokens only in `theme.css`; GSAP and three.js only in lazy modules under `AfterIdle`; `StageCanvas` and its tier pixel ratios, the GSAP ticker as the one clock.
- Tests first: the crumple model (spring, crease accumulation and cap, pointer to sheet coordinates) as pure functions with unit tests in `packages/ui/tests/`; a story with `play` and accessibility check for the component; an e2e test that opens an unknown address and runs the WCAG 2.2 AA, design-token and motion audits on it.
- The 404 is not a `Route`, so it is not added to `apps/web/e2e/support/routes.ts`; its e2e test and its Lighthouse run use an explicit unknown URL (for example `/cette-page-n-existe-pas`).
- Lighthouse on that URL, mobile and desktop: performance ≥ 0.95, the others at 1.
- `motion-review` grid on the arrival and the game, then the `design-reviewer` agent.
- No ADR: no new dependency, technology or pattern (`Stage` and `StageCanvas` already exist).

## Left to the builder

- The subdivision of the sheet, the crumple field (fold count, sharpness, wrinkle depth) and its seed, tuned against React Bits' look and the paper references in `.context/papier/`.
- How creases are stored between crumples (an accumulated crease texture or a list of fold lines passed as uniforms).
- How the posters are produced (captured from the scene's first and flat frames, as the other stages do) and their format (AVIF).
- The exact component split in `packages/ui` (a `PaperSheet` component, its lazy scene, its model) and its place in `packages/ui/AGENTS.md`.
