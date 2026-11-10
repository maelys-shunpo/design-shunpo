import { describe, expect, it } from "vitest";

import { filmLayers } from "../src/agents/wheel-film-loops.ts";

const rests = [{ pose: 10 }, { pose: 40 }, { pose: 80 }];

describe("filmLayers", () => {
  it("draws only the loop while the wheel rests on a phase", () => {
    expect(
      filmLayers({ course: { travel: 1, active: 1 }, rests, looping: 35, caught: undefined }),
    ).toEqual([{ position: 35, weight: 1 }]);
  });

  it("fades the loop caught as the dots set off into the paper the scroll carries", () => {
    const layers = filmLayers({
      course: { travel: 1.075, active: 1 },
      rests,
      looping: undefined,
      caught: { phase: 1, position: 35 },
    });

    expect(layers[0]?.position).toBe(35);
    expect(layers[0]?.weight).toBeCloseTo(0.5);
    expect(layers[1]?.weight).toBeCloseTo(0.5);
  });

  it("draws only the scrolled paper away from the caught loop's dot", () => {
    expect(
      filmLayers({
        course: { travel: 1.95, active: 2 },
        rests,
        looping: undefined,
        caught: { phase: 1, position: 35 },
      }),
    ).toEqual([{ position: 80, weight: 1 }]);
  });
});
