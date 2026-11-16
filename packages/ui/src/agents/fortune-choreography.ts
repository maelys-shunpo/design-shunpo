import { gsap } from "gsap";

import { duration, ease } from "../motion/tokens.ts";
import type { CookieLayout } from "./fortune-geometry.ts";

/* The layers and parts the choreography moves. */
export interface CookieParts {
  /* The whole scene: it rests lower while closed and rises as it opens, by its relative `top` rather than a
     transform, which would isolate the photographs' multiply from the page and show their white. */
  scene: HTMLElement;
  /* The photographs together: what floats at rest. */
  float: HTMLElement;
  whole: HTMLElement;
  cracked: HTMLElement;
  openLeft: HTMLElement;
  openRight: HTMLElement;
  label: HTMLElement;
  paper: HTMLElement;
  fold: HTMLElement;
  link: HTMLElement;
}

type Layer = "whole" | "cracked" | "openLeft" | "openRight";

const LAYERS: readonly Layer[] = ["whole", "cracked", "openLeft", "openRight"];

/* A cracked cookie gives a little under the thumb. */
const PRESSED_SCALE = 0.985;
/* The resting cookie drifts a few pixels up and down and leans a little: slow, never more than the photograph's own
   shadow can follow. */
const FLOAT_RISE = -5;
const FLOAT_LEAN = 0.6;
const FLOAT_PERIOD = 3;
/* The open halves settle from a slight tilt. */
const HALF_TILT = 1.5;
/* The paper comes out of the fold a touch askew, then lies straight to be read. */
const PAPER_TILT = -1.5;
const FOLD_PERSPECTIVE = 900;
/* Once the paper leaves the fold: its fold opens, then the link rises, then the paper takes focus. */
const PAPER_DELAY = 0.12;
const FOLD_DELAY = 0.42;
const LINK_DELAY = 0.78;
const SETTLED_DELAY = 1.12;
const LINK_BELOW_PERCENT = 105;

function showLayers(parts: CookieParts, shown: readonly Layer[]): void {
  for (const layer of LAYERS) {
    gsap.set(parts[layer], { autoAlpha: shown.includes(layer) ? 1 : 0 });
  }
}

/* The cookie at rest: whole, the paper hidden in its fold. */
export function rest(parts: CookieParts, layout: CookieLayout): void {
  gsap.killTweensOf(Object.values(parts));
  showLayers(parts, ["whole"]);
  gsap.set([parts.whole, parts.cracked], { scale: 1 });
  gsap.set(parts.scene, { top: layout.restOffset });
  gsap.set(parts.label, { autoAlpha: 1 });
  gsap.set(parts.paper, { autoAlpha: 0, transform: layout.paperStart });
  gsap.set(parts.fold, { rotationY: -180, transformPerspective: FOLD_PERSPECTIVE });
  gsap.set(parts.link, { autoAlpha: 1, yPercent: LINK_BELOW_PERCENT });
}

/* The cookie drifts until it is touched, opened or out of the window (`paused`). */
export function float(parts: CookieParts): void {
  gsap.killTweensOf(parts.float);
  gsap.fromTo(
    parts.float,
    { y: 0, rotation: -FLOAT_LEAN },
    {
      y: FLOAT_RISE,
      rotation: FLOAT_LEAN,
      duration: FLOAT_PERIOD,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    },
  );
}

/* It stops where it is and comes back to rest before the photograph changes. */
function settle(parts: CookieParts): void {
  gsap.killTweensOf(parts.float);
  gsap.to(parts.float, { y: 0, rotation: 0, duration: duration.fast, ease: ease.standard });
}

/* Pressing the cookie: it settles and cracks. */
export function press(parts: CookieParts): void {
  settle(parts);
  showLayers(parts, ["cracked"]);
  gsap.fromTo(
    parts.cracked,
    { scale: 1 },
    { scale: PRESSED_SCALE, duration: duration.fast, ease: "none" },
  );
}

/* Released before it opened: the cookie is whole again. */
export function release(parts: CookieParts): void {
  gsap.killTweensOf([parts.whole, parts.cracked]);
  showLayers(parts, ["whole"]);
  gsap.set([parts.whole, parts.cracked], { scale: 1 });
  float(parts);
}

/* Opens the cookie: the halves part, the paper slides out of the fold, comes to rest in front of them and
   unfolds, the link rises; `onSettled` runs once the paper can be read. */
export function open(
  parts: CookieParts,
  layout: CookieLayout,
  { onSettled }: { onSettled: () => void },
): void {
  const timeline = gsap.timeline();
  timeline
    .call(() => {
      showLayers(parts, ["openLeft", "openRight"]);
    })
    .from(
      parts.openLeft,
      { x: layout.spread, rotation: HALF_TILT, duration: duration.fast, ease: ease.inOut },
      0,
    )
    .from(
      parts.openRight,
      { x: -layout.spread, rotation: -HALF_TILT, duration: duration.fast, ease: ease.inOut },
      0,
    )
    .to(parts.scene, { top: 0, duration: duration.slow, ease: ease.inOut }, PAPER_DELAY)
    .to(parts.label, { autoAlpha: 0, duration: duration.fast, ease: "none" }, 0)
    .set(parts.paper, { autoAlpha: 1 }, 0)
    .to(
      parts.paper,
      {
        x: 0,
        y: 0,
        rotation: PAPER_TILT,
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        duration: duration.slow,
        ease: ease.emphasized,
      },
      PAPER_DELAY,
    )
    .to(
      parts.fold,
      { rotationY: 0, duration: duration.slow, ease: ease.emphasized },
      PAPER_DELAY + FOLD_DELAY,
    )
    .to(
      parts.link,
      { yPercent: 0, duration: duration.slow, ease: ease.emphasized },
      PAPER_DELAY + LINK_DELAY,
    )
    .to(
      parts.paper,
      { rotation: 0, duration: duration.base, ease: ease.inOut },
      PAPER_DELAY + LINK_DELAY,
    )
    .call(onSettled, [], PAPER_DELAY + SETTLED_DELAY);
}

/* The final state at once (reduced motion, or a resize once open). */
export function poseOpen(parts: CookieParts): void {
  gsap.killTweensOf(Object.values(parts));
  gsap.set(parts.float, { y: 0, rotation: 0 });
  gsap.set(parts.scene, { top: 0 });
  showLayers(parts, ["openLeft", "openRight"]);
  gsap.set([parts.openLeft, parts.openRight], { scale: 1, x: 0, rotation: 0 });
  gsap.set(parts.label, { autoAlpha: 0 });
  gsap.set(parts.paper, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
  });
  gsap.set(parts.fold, { rotationY: 0, transformPerspective: FOLD_PERSPECTIVE });
  gsap.set(parts.link, { autoAlpha: 1, yPercent: 0 });
}
