import { describe, expect, it } from "vitest";

import { createSignal, type FilmRest } from "../src/agents/wheel-film-course.ts";
import { createLoops, filmLayers } from "../src/agents/wheel-film-loops.ts";

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

/* The film is never seen here (`see` is never told otherwise), so no clock runs and every phase is read at its first
   instant: enough to tell its entrance's first frame from its pose. */
function restingLoops(phases: readonly FilmRest[]) {
  return createLoops({ rests: phases, paused: createSignal(false), draw: () => {} });
}

describe("createLoops", () => {
  it("catches the frame on screen when the dots set off while a phase's entrance still plays", () => {
    const entering: FilmRest[] = [
      { pose: 10, entrance: { from: 2, to: 10, seconds: 1 } },
      { pose: 40 },
      { pose: 80 },
    ];
    const loops = restingLoops(entering);

    loops.follow({ travel: 0, active: 0 });

    expect(loops.layers({ travel: 0, active: 0 })).toEqual([{ position: 2, weight: 1 }]);

    loops.follow({ travel: 0.05, active: 0 });

    expect(loops.layers({ travel: 0.05, active: 0 })[0]?.position).toBe(2);
  });

  it("catches the pose of a phase left with its entrance played out", () => {
    const loops = restingLoops(rests);

    loops.follow({ travel: 1, active: 1 });
    loops.follow({ travel: 1.05, active: 1 });

    expect(loops.layers({ travel: 1.05, active: 1 })[0]?.position).toBe(40);
  });
});
