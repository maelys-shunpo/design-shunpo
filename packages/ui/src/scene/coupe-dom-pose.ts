/* The coupe's pose as resolution-independent scalars, retargeted from the WebGL pose (coupe-pose.ts) to the DOM. It
   maps the gesture's progress to the transforms the clipped FAQ halves, the SVG blade and the scene need, with no
   three.js and no pixels: the consuming components turn these fractions and ratios into CSS. The gesture itself,
   its throw, hairline, slide, part, shake and reveal windows, all live in coupe-geometry.ts; this module only
   composes them into one structure per side. */

import {
  gestureProgress,
  GHOST_COUNT,
  ghostRaw,
  ghostVisible,
  partAt,
  shake,
  slideAt,
  slitOpacity,
  throwPosition,
  throwVisible,
} from "../motion/coupe-geometry.ts";

/* The cut line, copied from the WebGL world (coupe-world.ts: CUT_CENTER = (0, -0.35), CUT_DIRECTION = (1, -0.3)) as
   values that carry no resolution. The framed screen there is SCREEN_HEIGHT world units tall, so the centre becomes an
   offset in fractions of the framed screen, y positive upward as in world space, and the direction becomes the angle
   the blade falls at. This module never maps to pixels; the components that draw the blade and clip the halves do. */
const SCREEN_HEIGHT = 8;
const CUT_CENTER = { x: 0, y: -0.35 / SCREEN_HEIGHT } as const;
const CUT_ANGLE = Math.atan2(-0.3, 1);

/* The star spins five full turns as it crosses (the WebGL pose turned it ten half-turns, Math.PI * 10); negative keeps
   its own spin direction. A flyer's turns scale with how far it is along the cut. */
const SPIN_TURNS = 5;

/* The closing waits on the night behind the halves; it is uncovered once they are about half parted. Past this the pose
   reports `revealed` so the component can drop `inert` and let the closing take the pointer. */
const REVEAL_AT_PART = 0.5;

export interface CoupeDomFlyer {
  visible: boolean;
  /* Where it sits along the cut, 0 at the entry edge, 1 at the far edge. */
  along: number;
  spinTurns: number;
}

export interface CoupeDomSlit {
  opacity: number;
  /* How far the hairline reaches from the entry edge, up to the star's head. */
  along: number;
}

export interface CoupeDomHalf {
  /* 1 for the upper half, -1 for the lower: which way it slides and falls. */
  side: 1 | -1;
  slide: number;
  part: number;
}

export interface CoupeDomShake {
  x: number;
  y: number;
}

export interface CoupeDomCut {
  /* The cut's centre as an offset in fractions of the framed screen, y positive upward. */
  center: { x: number; y: number };
  angle: number;
}

export interface CoupeDomPose {
  star: CoupeDomFlyer;
  ghosts: CoupeDomFlyer[];
  slit: CoupeDomSlit;
  halves: CoupeDomHalf[];
  shake: CoupeDomShake;
  revealed: boolean;
  cut: CoupeDomCut;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function poseCoupeDom(sceneProgress: number): CoupeDomPose {
  const gesture = gestureProgress(sceneProgress);
  const head = throwPosition(gesture);
  const star: CoupeDomFlyer = {
    visible: throwVisible(gesture),
    along: head,
    spinTurns: -head * SPIN_TURNS,
  };
  const ghosts: CoupeDomFlyer[] = [];
  for (let index = 0; index < GHOST_COUNT; index += 1) {
    const along = clamp01(ghostRaw(gesture, index));
    ghosts.push({
      visible: ghostVisible(gesture, index),
      along,
      spinTurns: -along * SPIN_TURNS,
    });
  }
  const slide = slideAt(gesture);
  const part = partAt(gesture);
  const tremble = shake(gesture);
  return {
    star,
    ghosts,
    slit: { opacity: slitOpacity(gesture), along: head },
    halves: [
      { side: 1, slide, part },
      { side: -1, slide, part },
    ],
    shake: { x: tremble, y: tremble * 0.6 },
    revealed: part >= REVEAL_AT_PART,
    cut: { center: { x: CUT_CENTER.x, y: CUT_CENTER.y }, angle: CUT_ANGLE },
  };
}
