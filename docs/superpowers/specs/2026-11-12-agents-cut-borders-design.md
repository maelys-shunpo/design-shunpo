# Agents: one corner language, the cut

Date: 12 November 2026. Chosen by Maëlys on two boards of mockups (`.superpowers/brainstorm/`, screens `coupe-bordures`, `coupe-flottants`, `coupe-autres-flottants`).

## Intent

The Agents direction speaks two corner languages at once: the cut (« La coupe ») on actions, testimonials and paper tiles, and rounded corners everywhere else (82 `rounded-*` classes in about thirty components, `--corner-scale: 2`). The page reads inconsistent. The cut is the signature of the brand; every border of the direction now follows it.

Chosen direction, in Maëlys' words on the board: « une seule coupe, le reste vif ».

## Goals

- Square corners everywhere in the Agents direction. No rounded corner left, except true circles.
- One 45° cut at the top right of each top-level object, its 1 px Shiro hairline (`agents-line`) running along it, its depth proportional to the object.
- Floating notes (things handed to the visitor) show the cut folded inwards, like a corner of washi.
- One primitive for every cut in `theme.css`, instead of four utilities copying the same polygon.
- DESIGN.md says it once, as a « Coupe » table replacing the « Radius » table.

## Non-goals

- Other directions (Instant, Mécanique, Origami, Fil, the home page): untouched. Their tokens and components stay as they are.
- No change of colour, type, spacing, motion of the actions' cut (open on hover, close on press), or layout.
- No `corner-shape: bevel`: Chromium-only (Chrome/Edge 139+), Safari and Firefox fall back to a rounded corner, the very thing we remove. Revisit when Safari ships it (that would get an ADR then).

## Anti-goals (failure even if it works)

- A rounded corner beside a cut on the same screen.
- Cuts nested inside cuts (a cut card holding cut rows).
- A fold that reads like a button, or a cut on something that is not an object (a chip, a field, a row).
- A box shadow or an outline clipped flat across the diagonal: shadows and focus follow the cut.

## The rules

### Scale (Maëlys: proportional)

| Role          | Cut                             | Used by                                                                |
| ------------- | ------------------------------- | ---------------------------------------------------------------------- |
| Action        | 8 px (10 px on the 48 px calls) | `Action`, unchanged: opens to 14 (18) on hover, 5 (6) on press         |
| Nav           | 14 px                           | the floating nav once it floats                                        |
| Small surface | 12 px                           | workflow nodes                                                         |
| Surface       | 16 px                           | record card, email draft, approval card (folded)                       |
| Card          | 20 px                           | cards, windows, tool tiles, the composer, the testimonial (already 20) |
| Stage         | 32 px                           | large photographed panels (`PhotoStage`, `rounded-stage` uses)         |

The numbers are tokens in `theme.css`, built from the spacing scale like the current `--agents-cut-*` values (the theme is locked, no arbitrary values). The 14 px paper tile (`agents-paper-cut`) keeps its 14 px.

### Who gets what

- **Top-level objects** (a window, a card, a tile, the composer, the nav, a stage): one cut at the top right, Shiro hairline along it, sheet inside it.
- **Inside a cut object** (Maëlys: « pas de boîtes, des filets »): no boxes. Rows of mail, tasks, journal, fields, events, decisions and tool calls become a list split by Shiro hairlines (`border-b`/`divide-y` in `agents-line`), square, no cut, no own border box. A hairline never crosses the diagonal: content keeps a padding of at least half the cut from the top right corner.
- **Floating notes** — `ToastNote`, `ApprovalCard` (waiting and approved states, `HeroCouchesApproval` included), `EmailDraft` (Maëlys: folded corner): the cut, with the cut triangle folded inwards. The fold is the reflection of the cut triangle across the cut line, lying inside the sheet: a paper triangle a shade darker than the sheet (the shade follows the sheet's tint: white, Kurenai `wait-tint`, Tenku `ok-tint`), the sheet's hairline along its long edge, a small drop shadow on the sheet. Depth 12 px on a toast, 16 px on the approval card and the draft. The fold never moves on hover (only actions move their cut).
- **Floating interface pieces** — `WorkflowNode` (12 px), `RecordCard` (16 px) (Maëlys: cut, not folded): the plain cut.
- **Chat bubbles** (Maëlys: cut on the speaker's side): the visitor's bubbles (right side) cut at the top right, the agent's and the team's (left side) cut at the top left, 10 px. The only exception to « top right »; DESIGN.md says so.
- **Chips and statuses** (`Chip`, `StatusPill`; Maëlys: square): square rectangles, their hairline, no cut.
- **Fields** (`TextField`): square, hairline, no cut. _(My call: the cut stays the sign of an action.)_
- **Small inner marks** (tool logo tiles inside toasts, nodes, rows; the inline send button inside `EmailDraft` and the approval buttons): square; buttons that are actions take the action cut (8 px).
- **Circles stay round**: avatars, status dots, typing dots, window traffic dots, the pause control, wheel and ring markers, focus rings around circles. They are shapes, not corners (`rounded-full` is not scaled by `--corner-scale`).

### Shadows and focus

- A cut object's shadow is a `drop-shadow` filter (as `agents-card-cut` does), never a `box-shadow`, which `clip-path` would cut flat. `shadow-agents-card` and `shadow-agents-float` get drop-shadow equivalents for cut objects.
- Focus on a cut object that is focusable follows the cut (the halo `::after` of `agents-cut`). On square elements, the existing `ring`/`outline` stays, square.

## The how (decided)

- `--corner-scale: 0` in the Agents block of `theme.css` turns every scaled `rounded-*` square at once; `rounded-full` stays round. Leftover `rounded-*` classes on non-circles are then removed from the Agents components (dead classes would mislead).
- One cut primitive in `theme.css` replaces the shape copied by `agents-cut-line`, `agents-paper-cut` and `agents-card-cut`: a depth (`--agents-cut`), the hairline and the sheet drawn by pseudo-elements through the same polygon (inner legs shorter by (2 − √2)·inset, the existing 0.59 px), a fill and a line colour as variables so tinted papers (Kurenai, Tenku, washi fibres) reuse it. `agents-cut` keeps its hover/press/focus behaviour on top. Variants: the fold (top right triangle), the left-side cut for bubbles. The testimonial washi (`agents-card-paper`) keeps working.
- No ADR: this is a design choice (golden rule 4). DESIGN.md gets the « Coupe » table and the rules above; the « Radius » table goes. `packages/ui/AGENTS.md` lists the new utility. Stories show each role, the fold on the three papers, and the bubbles.

## Constraints

- Golden rules: tokens only in `theme.css`, no arbitrary values, apps never style, tests first, no dead code (`knip`).
- `pnpm check`, `pnpm test:e2e` (design audit: radius scale, contrast; motion audit) and Lighthouse pass. The design audit's radius check must accept the Agents direction at 0 px radii.
- `clip-path` also clips the hit area: the cut stays small against the object, so no target loses usable area.
- Reduced motion: nothing here animates beyond the existing action cut.

## Left to the builder

- Exact token names and how the four utilities collapse into one primitive, as long as each existing visual stays pixel-identical where it is already cut (actions, testimonial, paper tile).
- The fold's exact shades per paper (one step darker than the sheet, checked on screen against the mockup).
- Which small inner marks are actions (cut) and which are decorative (square), component by component.
- The order of the component sweep.

## Edge cases settled after the builder check (my calls, to check)

1. **Notes and bubbles keep their shape wherever they sit.** « No boxes inside a cut object » is about rows and inner panels. A folded note (`ApprovalCard`, `HeroCouchesApproval`, `OsDecision`) and a chat bubble (the composer's request bubble included) are laid on the surface, not built into it, so they keep their fold or their speaker-side cut even inside a window. Everything else nested flattens: `ComposerPlan` inside `TaskComposer`, the figure tiles of `OsView`, the three agent cards of the Couches agents plane become hairline-separated blocks.
2. **`OsDecision` matches `ApprovalCard`.** Same object (a decision handed to a person, same Kurenai then Tenku paper), so it takes the same fold. The rule Maëlys validated: the fold for what is addressed to you (a message, a decision), the cut for interface pieces.
3. **`CaseCard` keeps its own fold (« Le pli », 40 → 48 px on hover, flap, arrow).** It is a link, so its fold moving under the pointer is the action's signal, consistent with « only actions move their cut ». It may move onto the shared primitive only if it stays pixel-identical. The « Coupe » table lists it as the case card's fold.
4. **The hairline only where there was a border.** White sheets on Kome get the Shiro hairline. Photographs (`PhotoStage`, the Couches tools photo), dark or tinted bubbles and `DocumentSheet` (a printed page, shadow only) get the cut without a separate hairline: the primitive's line colour equals its fill.
5. **States in hairline lists stay, squared.** Tinted rows (`OsDecision` aside, the week journal's approval, the week's events) keep their tint as square bands without a border. The selected `MailRow` keeps its lift as a square white band with its shadow: a state, not a box.
6. **`HaloTool` tiles take the action scale.** At 48 px (64 px from tablets) a 20 px cut would eat 40 % of the edge: 8 px, 10 px from tablets. The empty « your tool » slot stays a square dashed tile (a slot, not yet an object) and takes its cut when it turns solid; its Fushimi active border runs along the cut.

## Component sweep (from the audit of `packages/ui/src/agents`)

| Treatment                 | Components                                                                                                                                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cut 20 (card / window)    | `MockWindow`, `OsWindow`, `HeroSemaineWindow`, `HeroConvergenceGlimpse`, `HeroCouchesLayers` planes, `TaskComposer`, `ToolTile`, `ReferenceTile` (non-paper), `DocumentSheet` (no hairline), `Testimonial` (already), `HaloJournal` (already) |
| Cut 32 (stage)            | `PhotoStage`, `rounded-stage` uses in `HeroCouchesLayers` (no hairline on photographs)                                                                                                                                                        |
| Cut 14 (nav)              | `Nav` when floating                                                                                                                                                                                                                           |
| Cut 8 / 10 (tile)         | `HaloTool` tiles (square dashed while empty)                                                                                                                                                                                                  |
| Fold                      | `ToastNote` (12), `ApprovalCard`, `HeroCouchesApproval` approved state, `OsDecision` (16), `EmailDraft` (16)                                                                                                                                  |
| Plain cut, small          | `WorkflowNode` (12), `RecordCard` (16)                                                                                                                                                                                                        |
| Speaker-side cut          | `ChatBubble`, the composer's request bubble (10)                                                                                                                                                                                              |
| Case fold, unchanged      | `CaseCard`                                                                                                                                                                                                                                    |
| Hairlines, square, no box | `MailRow`, `ToolCall`, `FieldRow`, `SyncEvent`, `HeroSemaineJournal`, `HeroSemaineWeek`, `HeroConvergenceWorkspace` rows, `ComposerPlan`, `OsView` figure tiles, Couches agent cards                                                          |
| Square, no cut            | `Chip`, `StatusPill`, `TextField`, inner logo tiles, `OsWindow` focus ring                                                                                                                                                                    |
| Round, unchanged          | `Avatar`, `TypingDots`, status and window dots, `CaseRing`, `WheelStep`, `WheelFilmLayer`, `TestimonialCascade` dots, `ToolHalo`, `HeroCouches` avatar ring                                                                                   |
