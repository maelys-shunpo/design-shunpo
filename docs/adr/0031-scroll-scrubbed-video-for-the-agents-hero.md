---
# proposed | accepted | rejected | deprecated | superseded
# Agents always write `proposed`. Only a human sets another status.
status: proposed
date: 2026-11-10
decision-makers: [project owner]
---

# 0031. A scroll-scrubbed video for the « Agents » hero, held against the page by CSS

## Context and problem statement

The « Agents » page takes the hero of the SHUNPO home page: the client's sunrise film (night, red sun, peach dawn, 8.71 s) read by the scroll behind the promise, then the rest of the page rising over the still stage. The home page plays it with a `VideoScrub` component and GSAP pins (its ADR-0025); this repository has no video yet (ADR-0022 asks for an ADR when a page needs one), and here GSAP may only load in lazy modules after the first paint (ADR-0011, `packages/ui/AGENTS.md`). How does this page scrub a film and keep its stage under the next section without breaking either rule?

## Decision drivers

- Every frame reachable in both directions, on desktop and on phones.
- Lighthouse performance ≥ 0.95 on mobile: the LCP is a still, never the video, and nothing loads GSAP before the first paint.
- The stage stays still while the next section covers it, without a scroll-linked transform that lags the native scroll on touch devices.
- Reduced motion shows a complete, still page.

## Considered options

- A `<video>` seeked through `currentTime` by a GSAP timeline loaded once idle, the stage held by CSS `position: sticky` against the page itself
- The same video, held and released by a ScrollTrigger pin (`pinSpacing: false`), as on the home page
- The film as an AVIF frame sequence drawn on a 2D canvas (ADR-0030)

## Decision outcome

Chosen option: "A `<video>` seeked by a lazy GSAP timeline, held by CSS", because one H.264 file and one VP9 file (3.0 MB and 1.8 MB, keyframe every 8 frames, `+faststart`) carry a film whose frame sequence would weigh several times more, and a sticky stage holds without JavaScript on the main thread. A pin created after idle would wrap the stage in a spacer once the page has painted and would track the scroll from script.

- `HeroFilm` (`packages/ui/src/agents/hero-film.tsx`) renders the poster through `next/image` (the LCP), an empty `<video preload="none">` over it and the promise. Its root is `display: contents`, so the sticky stage's containing block is the page's `<main>`: the stage stays at the top of the window until the page ends, and the page's following sections, wrapped in one opaque `CoverSheet` (`relative z-10`), rise over it.
- `HeroFilmMotion` (`hero-film-motion.tsx`), rendered inside `AfterIdle`, builds one timeline scrubbed across two screens of hold (`hero-film-course.ts`): the film's progress, the promise's light scheme and burn.
- `motion/video-seeker.ts` (ported from the home page) attaches the sources, MP4 first for Safari's precise seeking, only once the visitor engages (scroll, wheel, touch, pointer, key, or a page already scrolled), the stage is at most a screen away and the browser is idle; it runs one seek at a time.
- Under reduced motion nothing sticks, the still replaces the poster and the video never loads.
- Files live in `apps/web/public/media/agents/` and go through `NEXT_PUBLIC_BASE_PATH` (ADR-0023).

### Consequences

- Good, because the film stays faithful to the client's footage and seeks backwards.
- Good, because the hold and the cover are pure CSS: no layout shift, no transform following the scroll.
- Bad, because the stage stays painted under the whole page; it is covered, never redrawn, but a page using `HeroFilm` must wrap everything after it in `CoverSheet`, or the stage shows through.
- Bad, because video seeking is not frame-exact on every browser, and Safari seeks less precisely on WebM.
- Bad, because the files are heavy: they are budgeted with Lighthouse, and load only after engagement.

## More information

- [HTMLMediaElement.currentTime](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime), [position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky), [display: contents](https://developer.mozilla.org/en-US/docs/Web/CSS/display#contents)
- Related: ADR-0011, ADR-0022, ADR-0023, ADR-0030; the home page's ADR-0025 (shunpo-landing-page-design).
- Revisit when a second page needs a scrubbed film (then `HeroFilm` leaves the « Agents » folder), or when the film moves to WebGL.
