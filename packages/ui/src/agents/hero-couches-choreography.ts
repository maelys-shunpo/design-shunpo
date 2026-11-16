import { ease, stagger } from "../motion/tokens.ts";

/* The painted first frame: the window low in the stage, cut by the fold, tipped back like a sheet on a desk, and
   drawn larger on wide screens only (on tablets it would run past both edges). */
export const couchesPoster = {
  yPercent: 12,
  wideYPercent: 80,
  rotationX: 20,
  wideScale: 1.25,
} as const;

/* The exploded view: the camera tipped into an isometric look, the planes turned a little and drawn smaller; lower
   and smaller in a short window, so your plane stays clear of the floating header. */
const exploded = {
  rotationX: 54,
  rotation: -30,
  drift: -6,
  tall: { yPercent: 18, scale: 0.72 },
  short: { yPercent: 26, scale: 0.64 },
} as const;

/* Below this window height (px), the exploded view takes its short framing. */
const SHORT_WINDOW = 850;

/* The finished interface, facing the visitor, raised so the release toward the next section leaves little empty. */
const facing = { yPercent: -14, scale: 1 } as const;

function wide(): boolean {
  return window.matchMedia("(min-width: 64rem)").matches;
}

function posterScale(): number {
  return wide() ? couchesPoster.wideScale : 1;
}

function posterDrop(): number {
  return wide() ? couchesPoster.wideYPercent : couchesPoster.yPercent;
}

function framing(): (typeof exploded)["tall"] | (typeof exploded)["short"] {
  return window.innerHeight < SHORT_WINDOW ? exploded.short : exploded.tall;
}

/* The gap between two planes, as a share of a plane's height: the threads are drawn twice as long (`h-full`). */
export const couchesGap = 0.5;

/* The planes sit a pixel apart while they rest together, so the browser never has to guess which one is on top. */
export const couchesRest = { you: 2, agents: 1 } as const;

/* Shares of the hold, the whole timeline being 1: the copy leaves, the camera tips, the planes part, a task travels
   down the red thread and its result comes back, then the planes close and the camera faces the interface. */
const phase = {
  leave: { at: 0, span: 0.16 },
  tip: { at: 0.04, span: 0.28 },
  part: { at: 0.26, span: 0.18 },
  label: { at: 0.2, span: 0.1 },
  down: { at: 0.46, span: 0.14 },
  land: { at: 0.6, span: 0.03 },
  up: { at: 0.63, span: 0.12 },
  ring: { at: 0.75, span: 0.03 },
  settle: { at: 0.78, span: 0.04 },
  close: { at: 0.82, span: 0.14 },
  face: { at: 0.82, span: 0.16 },
  outro: { at: 0.9, span: 0.08 },
} as const;

function item(name: string): string {
  return `[data-couches='${name}']`;
}

function plane(name: string): string {
  return `[data-couches-plane='${name}']`;
}

function heightOf(_index: number, element: HTMLElement): number {
  return element.offsetHeight;
}

/* The camera tips from the painted poster into the isometric view while the copy leaves upward. */
function tip(timeline: gsap.core.Timeline): void {
  timeline
    .to(
      item("copy"),
      { yPercent: -24, opacity: 0, duration: phase.leave.span, ease: ease.exit },
      phase.leave.at,
    )
    .fromTo(
      item("tilt"),
      {
        y: 0,
        yPercent: posterDrop,
        rotationX: couchesPoster.rotationX,
        scale: posterScale,
      },
      {
        y: 0,
        yPercent: () => framing().yPercent,
        rotationX: exploded.rotationX,
        scale: () => framing().scale,
        duration: phase.tip.span,
        ease: ease.inOut,
      },
      phase.tip.at,
    )
    .fromTo(
      item("rig"),
      { rotation: 0 },
      { rotation: exploded.rotation, duration: phase.tip.span, ease: ease.inOut },
      phase.tip.at,
    )
    /* While the planes stand apart, the view keeps turning slowly: the scene holds without freezing. */
    .to(
      item("rig"),
      {
        rotation: exploded.rotation + exploded.drift,
        duration: phase.face.at - phase.tip.at - phase.tip.span,
        ease: "none",
      },
      phase.tip.at + phase.tip.span,
    );
}

/* The planes part along the depth, the threads grow with them and the labels arrive beside each plane. */
function part(timeline: gsap.core.Timeline): void {
  const settle = { duration: phase.part.span, ease: ease.inOut };
  timeline
    .fromTo(
      plane("you"),
      { z: couchesRest.you },
      {
        z: (index: number, element: HTMLElement) => 2 * couchesGap * heightOf(index, element),
        ...settle,
      },
      phase.part.at,
    )
    .fromTo(
      plane("agents"),
      { z: couchesRest.agents },
      {
        z: (index: number, element: HTMLElement) => couchesGap * heightOf(index, element),
        ...settle,
      },
      phase.part.at,
    )
    .fromTo(item("line"), { scaleY: 0 }, { scaleY: 1, ...settle }, phase.part.at)
    .fromTo(
      item("label"),
      { x: -16, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: phase.label.span,
        ease: ease.standard,
        stagger: stagger.base,
      },
      phase.label.at,
    );
}

/* A task leaves the interface down the red thread, through the agent, into the tool; its result comes back up. The
   pulse lies flat like the planes and travels along the depth, from your plane (twice the gap) to the tools' (0). */
function yourPlane(_index: number, element: HTMLElement): number {
  return 2 * couchesGap * (element.parentElement?.offsetHeight ?? 0);
}

function route(timeline: gsap.core.Timeline): void {
  const travel = { ease: ease.inOut };
  const settled = phase.up.at + phase.up.span;
  timeline
    .fromTo(
      item("pulse"),
      { z: yourPlane, opacity: 0, scale: 0.6 },
      { z: 0, opacity: 1, scale: 1, duration: phase.down.span, ...travel },
      phase.down.at,
    )
    .fromTo(
      item("target"),
      { opacity: 0 },
      { opacity: 1, duration: phase.land.span },
      phase.land.at,
    )
    .to(item("pulse"), { z: yourPlane, duration: phase.up.span, ...travel }, phase.up.at)
    .to([item("pulse"), item("before")], { opacity: 0, duration: phase.land.span }, settled)
    .fromTo(item("after"), { opacity: 0 }, { opacity: 1, duration: phase.land.span }, settled)
    /* The result reaches your plane: the decision waiting for you lights, then settles once approved. */
    .fromTo(
      item("approval-ring"),
      { opacity: 0 },
      { opacity: 1, duration: phase.ring.span },
      phase.ring.at,
    )
    .to(item("approval"), { opacity: 0, duration: phase.settle.span }, phase.settle.at)
    .fromTo(
      item("approved"),
      { opacity: 0 },
      { opacity: 1, duration: phase.settle.span },
      phase.settle.at,
    );
}

/* The planes close, the labels and the routed tool step back, and the camera turns to face the finished interface. */
function close(timeline: gsap.core.Timeline): void {
  const settle = { duration: phase.close.span, ease: ease.inOut };
  timeline
    .to(
      [item("label"), item("target"), item("approval-ring")],
      { opacity: 0, duration: phase.land.span * 2, ease: ease.exit },
      phase.close.at,
    )
    .to(plane("you"), { z: couchesRest.you, ...settle }, phase.close.at)
    .to(plane("agents"), { z: couchesRest.agents, ...settle }, phase.close.at)
    .to(item("line"), { scaleY: 0, ...settle }, phase.close.at)
    .to(
      item("tilt"),
      {
        yPercent: facing.yPercent,
        rotationX: 0,
        scale: facing.scale,
        duration: phase.face.span,
        ease: ease.inOut,
      },
      phase.face.at,
    )
    .to(item("rig"), { rotation: 0, duration: phase.face.span, ease: ease.inOut }, phase.face.at)
    .fromTo(
      item("outro"),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: phase.outro.span, ease: ease.standard },
      phase.outro.at,
    )
    /* The finished interface rests for the last moments of the hold before the page moves on. */
    .to({}, { duration: 1 - phase.face.at - phase.face.span }, phase.face.at + phase.face.span);
}

/* « Vue éclatée »: the SHUNPO interface opens into its three layers (you, the agents, your tools), shows one task
   travelling through them, then closes into the interface you use. Progress 0 is the painted poster. */
export function explodeLayers(timeline: gsap.core.Timeline): void {
  tip(timeline);
  part(timeline);
  route(timeline);
  close(timeline);
}
