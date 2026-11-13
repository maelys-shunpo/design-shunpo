import { gsap } from "gsap";

import { ease } from "../motion/tokens.ts";

/* The folded sign along the scroll, as pure functions of the page's progress (0 to 1): four sheets fold one after
   another into points, swirl in to the centre and lock into the SHUNPO sign, a pebble grows under it, then it turns
   a quarter in one sharp step while the camera rises to face it. Eases are the motion tokens, read as functions. */

type Triple = readonly [number, number, number];

export const STEPS = {
  fold: [0.05, 0.4],
  gather: [0.4, 0.7],
  pebble: [0.7, 0.8],
  snap: [0.8, 0.88],
} as const;

/* 0 before `start`, 1 after `end`, linear between. */
export function phase(progress: number, start: number, end: number): number {
  return Math.min(Math.max((progress - start) / (end - start), 0), 1);
}

/* Travel and camera moves on the page's in-out ease; arrivals settle on its emphasized one, the Shunpo turn too:
   most of the step is taken at once, then it lands. */
const smooth = gsap.parseEase(ease.inOut);
const arrive = gsap.parseEase(ease.emphasized);

/* Each sheet folds over 40 % of the folding, a new one starting every 20 %: one leads, the next already moves. */
const FOLD_SHARE = 0.4;
const FOLD_STAGGER = 0.2;
const GATHER_SHARE = 0.64;
const GATHER_STAGGER = 0.12;

function share(index: number, stagger: number): number {
  return index * stagger;
}

export function foldStart(index: number): number {
  const [start, end] = STEPS.fold;
  return start + (end - start) * share(index, FOLD_STAGGER);
}

export function foldOf(index: number, progress: number): number {
  const [start, end] = STEPS.fold;
  const local = phase(progress, start, end);
  return phase(local, share(index, FOLD_STAGGER), share(index, FOLD_STAGGER) + FOLD_SHARE);
}

function gatherOf(index: number, progress: number): number {
  const [start, end] = STEPS.gather;
  const local = phase(progress, start, end);
  return phase(local, share(index, GATHER_STAGGER), share(index, GATHER_STAGGER) + GATHER_SHARE);
}

/* Where each sheet waits on the first frame, around the centre: its centre's distance and the angle it sits at
   past the axis of the point it becomes, and how far it is turned from its final heading. */
const LAID = [
  { radius: 1.1, ahead: 0.66, turned: -0.78 },
  { radius: 1.2, ahead: 0.82, turned: -0.42 },
  { radius: 1.06, ahead: 0.58, turned: -0.92 },
  { radius: 1.16, ahead: 0.76, turned: -0.56 },
] as const;

const QUARTER = Math.PI / 2;
/* From the centre of a sheet to its punched corner, which is the centre of the sign. */
const HALF_SHEET = 0.5;
export const LIFT = 0.62;
const BANK = 0.42;

export interface BranchPose {
  /* The punched corner of the sheet, on the floor of the sign. */
  x: number;
  y: number;
  z: number;
  /* Heading about the vertical, and a bank about the point's axis while it flies. */
  yaw: number;
  bank: number;
  fold: number;
}

/* A sheet's pose: laid apart, then swirling in on an arc, its centre sliding from its place to the axis of its
   point while it turns to its heading, so its punched corner lands on the centre of the sign. */
/* Where a branch heads once the sign has taken its quarter turn: its print is turned back by as much, so every
   logo reads upright on the finished sign. */
export function finalHeading(index: number): number {
  return -index * QUARTER + QUARTER;
}

/* The points lock: from just before the last one lands until the sign is whole. */
export function lockOf(progress: number): number {
  return phase(progress, STEPS.gather[1] - 0.06, STEPS.gather[1]);
}

export function branchPose(index: number, progress: number): BranchPose {
  const laid = LAID[index % LAID.length] ?? LAID[0];
  const axis = index * QUARTER;
  const travel = smooth(gatherOf(index, progress));
  const radius = laid.radius + (HALF_SHEET - laid.radius) * travel;
  const angle = axis + laid.ahead * (1 - travel);
  const yaw = -axis + laid.turned * (1 - travel);
  const arc = Math.sin(Math.PI * travel);
  return {
    x: Math.sin(angle) * radius + Math.sin(yaw) * HALF_SHEET,
    y: arc * LIFT,
    z: -Math.cos(angle) * radius + Math.cos(yaw) * HALF_SHEET,
    yaw,
    bank: arc * BANK,
    fold: foldOf(index, progress),
  };
}

/* The pebble grows out from under the sign, from the size of its hole, so it never crosses the frame's edge. */
const PEBBLE_FROM = 0.3;
/* The sign rises by the pebble's thickness before the pebble shows round it. */
const PEBBLE_THICKNESS = 0.062;

export interface SignPose {
  /* The pebble's scale, 0 while it is not there. */
  pebble: number;
  /* The sign's height above the floor and its quarter turn. */
  lift: number;
  spin: number;
}

export function signPose(progress: number): SignPose {
  const [start, end] = STEPS.pebble;
  const slide = phase(progress, start, end);
  return {
    pebble: slide === 0 ? 0 : PEBBLE_FROM + (1 - PEBBLE_FROM) * arrive(slide),
    lift: PEBBLE_THICKNESS * smooth(phase(slide, 0, 0.3)),
    spin: QUARTER * arrive(phase(progress, ...STEPS.snap)),
  };
}

interface Shot {
  at: number;
  position: Triple;
  target: Triple;
}

/* A three-quarter view on the laid sheets, closing in while the points gather, then rising to face the sign. */
const SHOTS: readonly Shot[] = [
  { at: 0, position: [0.55, 3.9, 4.1], target: [0, 0, 0.1] },
  { at: STEPS.gather[0], position: [0.4, 4.2, 3.9], target: [0, 0.12, 0.05] },
  { at: STEPS.pebble[0], position: [0.3, 6.4, 3.6], target: [0, 0.05, 0] },
  { at: STEPS.snap[1], position: [0, 7.9, 0.01], target: [0, 0, 0] },
];

function mix(from: Triple, to: Triple, amount: number): Triple {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

export function cameraShot(progress: number): { position: Triple; target: Triple } {
  const next = SHOTS.findIndex((shot) => shot.at > progress);
  const last = SHOTS.at(-1) ?? SHOTS[0];
  if (next === -1 || last === undefined) {
    return { position: last?.position ?? [0, 7.9, 0.01], target: last?.target ?? [0, 0, 0] };
  }
  const from = SHOTS[Math.max(next - 1, 0)] ?? last;
  const to = SHOTS[next] ?? last;
  const amount = smooth(phase(progress, from.at, to.at));
  return {
    position: mix(from.position, to.position, amount),
    target: mix(from.target, to.target, amount),
  };
}
