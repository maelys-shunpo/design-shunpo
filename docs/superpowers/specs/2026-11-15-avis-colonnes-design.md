# Agents: the testimonials drift in two columns

Date: 15 November 2026. Chosen by Maëlys on a clickable board of three directions (`.superpowers/brainstorm/`, screen `avis-trois-pistes`): « b », then « option 1 » (mirrored).

## Intent

The client wants to see more of the testimonials. Today `TestimonialCascade` shows two of the six at a time, swapping pairs every 14 s behind dots: the sixth appears after about 30 s, so most visitors never read four of them. The section should show several at once and keep them coming, in a continuous drift (the page's motion language: continuous flows, never per-element choreography).

## Approaches

| Direction                                                                       | Trade-off                                                                                                   | Verdict                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| A. All six at once, two staggered columns, title held beside them, one entrance | Everything readable and still; no motion beyond the arrival                                                 | Recommended, not chosen |
| **B. Two columns drifting in opposite directions, endlessly**                   | Shows four to five cards at once and keeps them moving; with six cards each one comes back about every 25 s | **Chosen**              |
| C. lemlist's quote large in the title face, the five others in a grid below     | Clear hierarchy, but taller and more editorial than the rest of the page                                    | Not chosen              |

### Layout: mirrored (option 1)

The references band right above (`ReferencesBand`: title left, logo columns drifting up and down on the right) has the same composition, and with the cases hidden (`casesAreShown = false`) the two sections follow each other. Mirroring the testimonials (columns on the left, title on the right) makes the second answer the first instead of repeating it. Chosen by Maëlys over keeping the title on the left.

## Goals

- From `lg`: the two drifting columns on the left half (columns 1–6), the copy on the right (title, ratings, Trustpilot link). Column one holds testimonials 1, 3, 5 drifting up; column two holds 2, 4, 6 drifting down, each at its own lap (about 46 s and 54 s, never in step). The window is a fixed height with a fade top and bottom.
- Below `lg`: the title and ratings first, then one row of cards drifting left.
- Reuse `Marquee` for the drift (GSAP in its lazy `MarqueeMotion` under `AfterIdle`, held off screen, under the pointer and while focus is inside, items repeated `aria-hidden inert`).
- No pause button (Maëlys, 15 November 2026). The pointer over either column holds both, and so does keyboard focus on the drift, which takes a tab stop for that. Known risk: WCAG 2.2.2 asks for a way to pause moving content that lasts over 5 s; holding under the pointer and on focus is the same answer as the references wall, weaker on touch screens.
- Reduced motion: nothing moves and nothing is clipped: the six cards stand whole (two still columns from `lg`, stacked below), no fade.
- Screen readers hear each testimonial once, in order, after the heading.
- `Testimonial` cards unchanged (washi leaf, cut corner, initials).

## Non-goals

- No new testimonials: the six published ones stay, word for word, until the client provides more real ones (DESIGN.md: no invented testimonial). The layout must take any number without code changes.
- No ratings as large rolling figures (a separate decision).
- No change to `ReferencesBand`.

## Anti-goals

- Two identical screens in a row (title left, drifting columns right, twice).
- A column that keeps moving off screen or under reduced motion.
- A seam or jump at the loop; a card cut by the fade under reduced motion.
- A per-card entrance on top of the drift.

## Decided by the builder (Claude's calls, to check)

- Column height: a new vertical `Marquee` viewport size for cards (the current up/down variant is a 2:5 aspect ratio sized for logos), as a token, about 680 px on a 900 px window.
- The drift lives in `packages/ui` as `TestimonialDrift`; `MarqueeMotion` treats it as one wall, like `ToolColumns`, so the pointer or focus anywhere in it holds every column.
- The copy stays first in the DOM; the grid gains whatever it needs to put it on the right of the same row (row placement on `GridArea` or a reversed order on `PageGrid`), no `className` in the app.
- `TestimonialCascade`, its story, its tests and the `agents-landing` utility are removed (knip); `use-auto-advance` stays for `AgentTabs`.
- DESIGN.md: the motion paragraph's « the testimonial loop stays minimal » becomes the drift; `packages/ui/AGENTS.md` lists the new pieces.
