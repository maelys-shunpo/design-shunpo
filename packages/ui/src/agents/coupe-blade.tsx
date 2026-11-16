"use client";

import { cva } from "class-variance-authority";

import { STAR } from "../brand/shuriken-paths.ts";
import { cn } from "../lib/cn.ts";
import type { CoupeDomPose } from "../scene/coupe-dom-pose.ts";

/* The blade layer draws in a uniform square viewport, 100 units tall for the framed height, centred on the cut's
   middle; `slice` fills the overlay so the crossing runs edge to edge whatever the aspect, and the star keeps its own
   proportions (no `preserveAspectRatio="none"` stretch). The pose carries its cut in WORLD convention (y up, a
   negative angle), so the screen reads it y-flipped: the vertical offset negates and the slope is `-tan(angle)`. */
const VIEW_HALF = 50;
/* The crossing reaches a touch past the filled viewport so the star enters and leaves off the overlay's edges. */
const CROSS_EDGE = 55;

/* The brand shuriken's path box (assets/source/brand/icon), its centre, and the share of the framed height the solid
   star stands about as tall as (retargeted from the WebGL pose: a half-unit star on an eight-unit frame). */
const STAR_BOX_HEIGHT = 165.59;
const STAR_CENTER_X = 77.19;
const STAR_CENTER_Y = 82.85;
const STAR_HEIGHT_UNITS = 18;
const STAR_SCALE = STAR_HEIGHT_UNITS / STAR_BOX_HEIGHT;

/* The three ghosts fade back along the Shunpo Shift, as the WebGL `buildStars` set them. */
const GHOST_OPACITY_BASE = 0.36;
const GHOST_OPACITY_STEP = 0.1;

/* The hairline left behind, as a share of a viewport unit; tuned in motion-review. */
const HAIRLINE_WIDTH = 0.3;

interface Point {
  x: number;
  y: number;
}

const bladeVariants = cva("pointer-events-none absolute inset-0 size-full overflow-visible");

interface CoupeBladeProps {
  /* The pose the parent recomputes each frame (`poseCoupeDom`); this layer only draws it. */
  pose: CoupeDomPose;
  className?: string;
}

/* A flyer's transform: placed on the cut, spun, then the path scaled down and centred on its own middle. The spin
   negates because the viewport is the world's, y-flipped. */
function flyerTransform(point: Point, spinTurns: number): string {
  const spin = -spinTurns * 360;
  return `translate(${point.x} ${point.y}) rotate(${spin}) scale(${STAR_SCALE}) translate(${-STAR_CENTER_X} ${-STAR_CENTER_Y})`;
}

/* The SVG blade over the FAQ: the SHUNPO shuriken thrown across the cut, its three trailing ghosts, and the hairline
   held from the entry edge to the star's head. Decorative (`aria-hidden`); the parent (the scene) poses it each frame.
   The star is Fushimi Glow, the hairline Fuji Night, both from tokens. */
export function CoupeBlade({ pose, className }: CoupeBladeProps) {
  const { star, ghosts, slit, cut } = pose;
  const centerX = cut.center.x * (VIEW_HALF * 2);
  const centerY = -cut.center.y * (VIEW_HALF * 2);
  const slope = -Math.tan(cut.angle);

  function along(fraction: number): Point {
    const x = -CROSS_EDGE + fraction * (CROSS_EDGE * 2);
    return { x, y: centerY + (x - centerX) * slope };
  }

  const entry = along(0);
  const head = along(slit.along);

  return (
    <svg
      data-slot="coupe-blade"
      aria-hidden="true"
      viewBox={`-${VIEW_HALF} -${VIEW_HALF} ${VIEW_HALF * 2} ${VIEW_HALF * 2}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn(bladeVariants(), className)}
    >
      <line
        data-coupe-blade-part="hairline"
        x1={entry.x}
        y1={entry.y}
        x2={head.x}
        y2={head.y}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{
          stroke: "var(--color-fuji-deep)",
          strokeWidth: HAIRLINE_WIDTH,
          opacity: slit.opacity,
        }}
      />
      {ghosts.map((ghost, index) =>
        ghost.visible ? (
          <g
            // oxlint-disable-next-line react/no-array-index-key -- the ghosts are positional, one per Shift step.
            key={index}
            data-coupe-blade-part="ghost"
            transform={flyerTransform(along(ghost.along), ghost.spinTurns)}
            style={{ opacity: GHOST_OPACITY_BASE - index * GHOST_OPACITY_STEP }}
          >
            <path d={STAR} style={{ fill: "var(--color-fushimi)" }} />
          </g>
        ) : null,
      )}
      {star.visible ? (
        <g
          data-coupe-blade-part="star"
          transform={flyerTransform(along(star.along), star.spinTurns)}
        >
          <path d={STAR} style={{ fill: "var(--color-fushimi)" }} />
        </g>
      ) : null}
    </svg>
  );
}
