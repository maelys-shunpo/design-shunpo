import { describe, expect, it } from "vitest";

import { paperShift, questionDrift } from "../src/agents/wheel-paper.ts";

/* A wheel held three screens of 900 px under an 80 px bar, its tile 538 px tall, the ink risen two pitches of 620 px
   at the end of the course; the question's time ends 0.35 screen into the hold. */
const frame = {
  stuck: 2700,
  timeline: 2620,
  hold: 3,
  questionEnd: 0.35,
  riseEnd: -1240,
  tile: 538,
};

function wrapped(value: number, tile: number): number {
  return ((value % tile) + tile) % tile;
}

describe("questionDrift", () => {
  it("moves the paper about as far as the page scrolls while only the question stands on it", () => {
    const scrolled =
      frame.stuck - frame.timeline + (frame.timeline * frame.questionEnd) / frame.hold;

    expect(Math.abs(questionDrift(frame) - scrolled)).toBeLessThanOrEqual(frame.tile / 2);
  });

  it("brings the paper back in phase with the sheet when the wheel lets it go", () => {
    const drift = questionDrift(frame);
    const atRelease = paperShift({ held: 3, rise: frame.riseEnd, drift, questionEnd: 0.35 });

    /* Released, the stage scrolls with the sheet again: its paper must continue the sheet's, a whole number of tiles
       away from where the sheet has gone meanwhile. */
    expect(wrapped(atRelease + frame.stuck, frame.tile)).toBeCloseTo(0, 6);
  });

  it("holds for any window height and any rise", () => {
    for (const [stuck, riseEnd] of [
      [2160, -980],
      [3240, -1500],
      [2400, 0],
    ] as const) {
      const other = { ...frame, stuck, timeline: stuck - 80, riseEnd };
      const atRelease = paperShift({
        held: 3,
        rise: riseEnd,
        drift: questionDrift(other),
        questionEnd: 0.35,
      });

      expect(wrapped(atRelease + stuck, frame.tile)).toBeCloseTo(0, 6);
    }
  });
});

describe("paperShift", () => {
  const drift = questionDrift(frame);
  function at(held: number, rise: number) {
    return paperShift({ held, rise, drift, questionEnd: 0.35 });
  }

  it("starts where the sheet's paper is as the stage is caught", () => {
    expect(at(0, 0)).toBe(0);
  });

  it("drifts with the page while only the question is on the paper", () => {
    expect(at(0.175, 0)).toBeCloseTo(-drift / 2, 6);
    expect(at(0.35, 0)).toBeCloseTo(-drift, 6);
  });

  it("rests while the ink rests, under the folded paper and its shadow", () => {
    expect(at(1.2, -620)).toBe(at(1.6, -620));
  });

  it("rises exactly with the ink, so the stroke stays painted on its paper", () => {
    expect(at(1.4, -300) - at(1.3, -200)).toBeCloseTo(-100, 6);
  });
});
