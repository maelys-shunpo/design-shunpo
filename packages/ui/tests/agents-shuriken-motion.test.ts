import { describe, expect, it } from "vitest";

import {
  branchPose,
  cameraShot,
  foldOf,
  finalHeading,
  foldStart,
  phase,
  signPose,
  STEPS,
} from "../src/scene/agents-shuriken-motion.ts";

const BRANCHES = [0, 1, 2, 3] as const;

describe("The folded sign along the scroll", () => {
  it("lays four flat sheets apart on the first frame", () => {
    const poses = BRANCHES.map((index) => branchPose(index, 0));

    expect(poses.map((pose) => pose.fold)).toEqual([0, 0, 0, 0]);
    expect(poses.map((pose) => pose.y)).toEqual([0, 0, 0, 0]);
    /* No two sheets overlap: their centres sit further apart than a sheet's diagonal (one unit). */
    const centres = poses.map((pose) => [
      pose.x - Math.sin(pose.yaw) * 0.5,
      pose.z - Math.cos(pose.yaw) * 0.5,
    ]);
    const gaps = centres.flatMap(([x = 0, z = 0], index) =>
      centres.slice(index + 1).map(([ox = 0, oz = 0]) => Math.hypot(x - ox, z - oz)),
    );
    expect(Math.min(...gaps)).toBeGreaterThan(1);
  });

  it("folds one sheet at a time: each starts while the one before is still folding", () => {
    const starts = BRANCHES.map((index) => foldStart(index));

    expect(starts[0]).toBe(STEPS.fold[0]);
    expect(starts).toEqual(starts.toSorted((first, second) => first - second));
    for (const index of BRANCHES) {
      expect(foldOf(index, foldStart(index))).toBeCloseTo(0, 9);
    }
    expect(foldOf(0, foldStart(1) + 0.01)).toBeLessThan(1);
    expect(foldOf(0, foldStart(1) + 0.01)).toBeGreaterThan(0);
    expect(foldOf(3, STEPS.fold[1])).toBe(1);
  });

  it("gathers every branch on the centre of the sign, turned a quarter from the one before", () => {
    const poses = BRANCHES.map((index) => branchPose(index, STEPS.gather[1]));

    for (const [index, pose] of poses.entries()) {
      expect(pose.x).toBeCloseTo(0, 6);
      expect(pose.z).toBeCloseTo(0, 6);
      expect(pose.y).toBeCloseTo(0, 6);
      expect(pose.yaw).toBeCloseTo((-index * Math.PI) / 2, 6);
    }
  });

  it("lifts each branch on an arc while it travels", () => {
    const middle = (STEPS.gather[0] + STEPS.gather[1]) / 2;

    expect(BRANCHES.some((index) => branchPose(index, middle).y > 0.2)).toBe(true);
  });

  it("grows the pebble under the sign from its hole, then turns the sign a quarter in one step", () => {
    expect(signPose(STEPS.pebble[0]).pebble).toBe(0);
    expect(signPose(STEPS.pebble[0] + 0.001).pebble).toBeLessThan(0.4);
    expect(signPose(STEPS.pebble[1]).pebble).toBeCloseTo(1, 6);
    expect(STEPS.pebble[1]).toBeLessThanOrEqual(STEPS.snap[0]);
    expect(signPose(STEPS.snap[0]).spin).toBe(0);
    expect(signPose(STEPS.snap[1]).spin).toBeCloseTo(Math.PI / 2, 6);
    /* The step is taken at once: most of the turn in the first fifth of its window, then it lands. */
    const [from, to] = STEPS.snap;
    expect(signPose(from + (to - from) * 0.2).spin / (Math.PI / 2)).toBeGreaterThan(0.7);
  });

  it("leaves a rest on the finished sign before the scene lets go", () => {
    expect(1 - STEPS.snap[1]).toBeGreaterThanOrEqual(0.1);
  });

  it("turns each print back by its branch's final heading", () => {
    expect([0, 1, 2, 3].map((index) => finalHeading(index))).toEqual([
      Math.PI / 2,
      0,
      -Math.PI / 2,
      -Math.PI,
    ]);
  });

  it("ends facing the sign from above", () => {
    const { position, target } = cameraShot(1);

    expect(position[1]).toBeGreaterThan(5);
    expect(Math.hypot(position[0] - target[0], position[2] - target[2])).toBeLessThan(0.05);
  });

  it("clamps a phase to its window", () => {
    expect(phase(0, 0.2, 0.4)).toBe(0);
    expect(phase(0.3, 0.2, 0.4)).toBeCloseTo(0.5, 9);
    expect(phase(1, 0.2, 0.4)).toBe(1);
  });
});
