"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "../lib/cn.ts";
import type { CoupeDomCut, CoupeDomHalf, CoupeDomPose } from "../scene/coupe-dom-pose.ts";

/* The DOM coupe: the frozen FAQ fed in as `children`, rendered as two stacked copies, each clipped to one side of the
   cut (upper above, lower below) and transformed from `pose.halves`, so the page gives along the blade's line and the
   two paper halves slide, part, tilt and fall. Retargeted from the WebGL pose (coupe-pose.ts `poseHalves`,
   coupe-world.ts `buildHalves`): the world-unit factors below are the same, scaled into the container's own space in
   CSS 3D. The cut line itself is static (only the halves move), so each `clip-path` is computed once from `pose.cut`.
   The cut arrives in WORLD convention (y up, a negative angle), so the DOM reads it y-flipped, as coupe-blade.tsx does,
   and blade and halves sit on the same line. The lower copy is `aria-hidden`: the upper copy carries the whole FAQ in
   the DOM (the clip is visual only), so a screen reader reads the questions once. */

/* The framed height is SCREEN_HEIGHT world units (coupe-world.ts), so one world unit is this share of the frame. The
   pose's `along` and `away` are in world units; this turns them into percentages of the container. */
const UNITS_PER_FRAME = 8;
const PERCENT_PER_UNIT = 100 / UNITS_PER_FRAME;

/* The half-motion factors, copied verbatim from the WebGL pose (coupe-pose.ts `poseHalves`): the upper half slides a
   little down the cut then falls far along it, the lower only falls back; both are thrown clear along the normal, lift
   off the page and tilt as they go, and the printed face darkens a touch. Their absolute scale is tuned in
   motion-review to match the WebGL rendering; only the structure and direction are fixed here. */
const SLIDE_ALONG = 0.32;
const PART_ALONG_UPPER = 1.2;
const PART_ALONG_LOWER = 0.6;
const SLIDE_AWAY = 0.03;
const AWAY = 8;
const TILT_X = 0.25;
const TILT_Z = 0.12;
const LIFT_Z = 0.3;
const DARKEN = 0.12;

/* The container's depth and how far a world unit of lift reaches into it, in pixels; both tuned in motion-review. */
const PERSPECTIVE_PX = 1600;
const LIFT_PER_UNIT_PX = 220;

const halvesVariants = cva("relative isolate size-full overflow-visible");

interface CoupeHalvesProps {
  /* The content to split along the cut — here the frozen FAQ. */
  children: ReactNode;
  /* The pose the parent (the scene) recomputes each frame (`poseCoupeDom`); this component only draws it. */
  pose: CoupeDomPose;
  className?: string;
}

function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/* The cut's vertical position (as a percentage of the container's height) at a horizontal percentage `x`. The pose's
   centre and angle are y-up world values, read y-flipped here so the line falls to the right exactly as the blade's. */
function cutYAt(cut: CoupeDomCut, x: number): number {
  const centerY = 50 - cut.center.y * 100;
  const slope = -Math.tan(cut.angle);
  return centerY + (x - 50) * slope;
}

/* The upper copy keeps everything above the cut; the lower copy everything below it. The line is the same for both,
   so the two clips tile the container with no seam and no overlap. */
function clipPathFor(cut: CoupeDomCut, side: 1 | -1): string {
  const left = round(cutYAt(cut, 0));
  const right = round(cutYAt(cut, 100));
  if (side > 0) {
    return `polygon(0% 0%, 100% 0%, 100% ${right}%, 0% ${left}%)`;
  }
  return `polygon(0% ${left}%, 100% ${right}%, 100% 100%, 0% 100%)`;
}

/* A half's CSS transform from its pose. The offset is decomposed along the cut (`along`) and its normal (`away`) in
   world units, composed back into world x/y, then y-flipped and scaled into the container. The lift becomes depth, and
   the two world tilts become CSS rotations (negated for the y-flip). */
function halfTransform(half: CoupeDomHalf, cut: CoupeDomCut): string {
  const along =
    half.side > 0
      ? half.slide * SLIDE_ALONG + half.part * PART_ALONG_UPPER
      : -half.part * PART_ALONG_LOWER;
  const away = half.side * (half.slide * SLIDE_AWAY + half.part * AWAY);

  const dirX = Math.cos(cut.angle);
  const dirY = Math.sin(cut.angle);
  const normalX = -dirY;
  const normalY = dirX;

  const offsetX = dirX * along + normalX * away;
  const offsetY = dirY * along + normalY * away;

  const translateX = round(offsetX * PERCENT_PER_UNIT);
  const translateY = round(-offsetY * PERCENT_PER_UNIT);
  const translateZ = round(half.part * LIFT_Z * LIFT_PER_UNIT_PX);
  const rotateX = round(radToDeg(half.side * half.part * TILT_X));
  const rotateZ = round(radToDeg(-half.side * half.part * TILT_Z));

  return `translate3d(${translateX}%, ${translateY}%, ${translateZ}px) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`;
}

interface HalfProps {
  half: CoupeDomHalf;
  cut: CoupeDomCut;
  children: ReactNode;
}

/* One paper half: the printed face carrying the (clipped) FAQ, and a washi back behind it, both cut to the same side
   of the line. The back is flipped away and shown by `backface-visibility` once the half tilts past upright, so the
   fibrous back of the sheet catches the light as the WebGL washi material does. The front darkens with `part`. */
function Half({ half, cut, children }: HalfProps) {
  const isUpper = half.side > 0;
  const clipPath = clipPathFor(cut, half.side);
  const layer: CSSProperties = {
    clipPath,
    WebkitClipPath: clipPath,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };
  return (
    <div
      data-coupe-half={isUpper ? "upper" : "lower"}
      aria-hidden={isUpper ? undefined : true}
      className="absolute inset-0"
      style={{ transformStyle: "preserve-3d", transform: halfTransform(half, cut) }}
    >
      <div
        data-coupe-half-face="front"
        className="absolute inset-0"
        style={{ ...layer, filter: `brightness(${round(1 - half.part * DARKEN)})` }}
      >
        {children}
      </div>
      <div
        data-coupe-half-face="washi"
        aria-hidden="true"
        className="absolute inset-0 agents-washi bg-agents-fold"
        style={{ ...layer, transform: "rotateY(180deg)" }}
      />
    </div>
  );
}

/* The two clipped FAQ halves of the DOM coupe. Controlled by `pose`; the scene poses it each frame over the frozen
   FAQ. At rest (`part` 0) both halves sit at identity and the clips rejoin the content into one block; as the gesture
   runs they slide, part, tilt and fall away to uncover the closing beneath. */
export function CoupeHalves({ children, pose, className }: CoupeHalvesProps) {
  const { halves, cut } = pose;
  return (
    <div
      data-slot="coupe-halves"
      className={cn(halvesVariants(), className)}
      style={{ perspective: `${PERSPECTIVE_PX}px` }}
    >
      {halves.map((half) => (
        <Half key={half.side > 0 ? "upper" : "lower"} half={half} cut={cut}>
          {children}
        </Half>
      ))}
    </div>
  );
}
