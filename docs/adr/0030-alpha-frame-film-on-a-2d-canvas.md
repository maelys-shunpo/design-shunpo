---
# proposed | accepted | rejected | deprecated | superseded
# Agents always write `proposed`. Only a human sets another status.
status: proposed
date: 2026-11-09
decision-makers: [project owner]
---

# 0030. A scroll-scrubbed alpha frame sequence on a 2D canvas, outside the WebGL stage

## Context and problem statement

The method wheel of `/agents` (`MethodWheel`) shows a paper film: two generated morphs and two short arrival clips, 208 frames cut out of their backdrop with an alpha channel (5.9 MB), laid on the page's paper, scrubbed by the wheel's own travel between phases, and each phase's short loop played in time while the wheel rests on it, with a control that pauses the loops (WCAG 2.2.2). ADR-0025 and the `cinematic-footage` skill route footage through `Stage` and `StageCanvas` (WebGL textures, a dissolve shader, a poster as LCP). This film needs none of the shader work: no grade, no grain, no dissolve between unchained shots, only alpha frames drawn in step with an existing scroll course, inside a component that already holds the stills that serve as fallback. Which renderer should play it?

## Decision drivers

- In step with the wheel: the paper must move in the same frame as the wheel's dots, from the course GSAP already runs.
- Transparent frames over the page's paper, the shadow kept, no visible backdrop.
- The guarantees of ADR-0025 that still apply: loaded after idle and near the viewport, nothing under reduced motion or on phones, no `canvas` then, a complete fallback (the stills).
- Smoothness on a fast scroll: decode off the main thread, never step between frames.
- Weight: no extra library on the first load.

## Considered options

- A 2D canvas fed by `createImageBitmap` frames, inside `MethodWheel` (`WheelFilm`, `wheel-film-frames.ts`).
- `Stage` with `StageCanvas` and the `footage-scene` reference of `cinematic-footage`: frames as WebGL textures.
- A `<video>` with an alpha channel, seeked by the scroll.
- Swapping `<img>` sources frame by frame.

## Decision outcome

Chosen option: "A 2D canvas fed by `createImageBitmap` frames", because it meets every driver with the least machinery. It loads after idle through `AfterIdle` and a lazy module, starts fetching when the wheel is within a screen of the window, six requests at a time (every 8th frame and each phase's rest first), keeps the frames compressed and decodes them off the main thread, twelve at most, six ahead in the direction of the scroll. It draws in the wheel's own GSAP frame and mixes the two decoded frames around the playhead with `lighter` compositing, which blends premultiplied colour and alpha exactly. It mounts only from 48rem with motion, so phones and reduced motion keep the stills and get no canvas, as ADR-0025 requires.

`StageCanvas` loses because it brings three.js, a WebGL context and the stage's tiering for a picture with no shader in it; its poster logic duplicates the stills the wheel already shows. A `<video>` with alpha is not portable: VP9 with alpha does not play in Safari, and HEVC with alpha plays only in Safari, so it would need two encodes, and seeking a video is not frame-exact on every browser. Swapping `<img>` sources decodes on the main thread and steps from frame to frame.

### Consequences

- Good, because the film costs no library: 5.9 MB of AVIF frames (more than the 150 frames `cinematic-footage` sets for AVIF sequences, within its 6 MB desktop budget), loaded only on tablets and desktops near the section, and no WebGL context.
- Good, because the paper moves in the same frame as the dots and never steps, even when a frame is still decoding.
- Bad, because this film lives outside `Stage`: the motion audit of `e2e/motion-audit.spec.ts` audits canvases inside `[data-slot=stage]` only, so its blank or frozen checks do not cover it; the component's own browser tests do (a canvas with an opaque frame, none under reduced motion or on phones).
- Bad, because a second footage path exists beside `cinematic-footage`: a film that needs a grade, grain or a dissolve still goes through `StageCanvas`.

## More information

- `createImageBitmap`: https://developer.mozilla.org/docs/Web/API/Window/createImageBitmap
- `globalCompositeOperation` (`lighter`): https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
- Related: ADR-0024 (rendering arsenal), ADR-0025 (stage host and quality tiers), ADR-0026 (motion verification).
- Revisit when a second page needs a frame film, or when one needs a shader treatment: then fold this path into `Stage`.
