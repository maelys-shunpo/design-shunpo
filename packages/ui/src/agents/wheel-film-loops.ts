import {
  type CourseValue,
  departureWeight,
  type FilmRest,
  filmPosition,
  loopPosition,
  restingPhase,
  type Signal,
} from "./wheel-film-course.ts";

/* One picture of the film to draw, and how much of it. */
export interface FilmLayer {
  position: number;
  weight: number;
}

interface Layering {
  course: CourseValue;
  rests: readonly FilmRest[];
  /* Where the loop of the phase the wheel rests on has got to, if it rests on one. */
  looping: number | undefined;
  /* The last loop caught as the dots set off: its phase and where it had got to. */
  caught: { phase: number; position: number } | undefined;
}

/* What to draw: the loop while the wheel rests on a phase; else the paper the scroll carries, with the loop caught as
   the dots set off fading into it. */
export function filmLayers({ course, rests, looping, caught }: Layering): FilmLayer[] {
  if (looping !== undefined) {
    return [{ position: looping, weight: 1 }];
  }
  const scrolled = filmPosition(course.travel, rests);
  const nearItsDot = caught !== undefined && caught.phase === Math.round(course.travel);
  const weight = nearItsDot ? departureWeight(course.travel) : 0;
  if (caught === undefined || weight <= 0) {
    return [{ position: scrolled, weight: 1 }];
  }
  return [
    { position: caught.position, weight },
    { position: scrolled, weight: 1 - weight },
  ];
}

/* Follows the phase the wheel names, and answers the one it named before (-1: the question). */
function rememberNamed() {
  let named = -1;
  let before = -1;
  return (active: number) => {
    if (active !== named) {
      before = named;
      named = active;
    }
    return before;
  };
}

interface Loops {
  rests: readonly FilmRest[];
  paused: Signal<boolean>;
  /* Draws the film again: the loop moved. */
  draw: () => void;
}

/* The loops of the phases, played in time while the wheel rests on one, never by the scroll: the scroll only carries
   the paper from one phase to the next, and a loop caught mid-way fades into it as the dots set off. They hold while
   paused, and while the film is out of the window. */
export function createLoops({ rests, paused, draw }: Loops) {
  let resting: number | undefined;
  let elapsed = 0;
  let last = 0;
  let clock = 0;
  let seen = false;
  let caught: { phase: number; position: number } | undefined;
  /* A phase comes in from before it when the phase named before it was earlier (or the question): its entrance plays. */
  let entering = false;
  const namedBefore = rememberNamed();
  function current(): number | undefined {
    const rest = resting === undefined ? undefined : rests[resting];
    return rest === undefined ? undefined : loopPosition(rest, elapsed, entering);
  }
  function tick(now: number) {
    clock = 0;
    if (resting === undefined || paused.get() || !seen) {
      return;
    }
    elapsed += (now - last) / 1000;
    last = now;
    draw();
    clock = requestAnimationFrame(tick);
  }
  function run() {
    if (clock === 0 && resting !== undefined && !paused.get() && seen) {
      last = performance.now();
      clock = requestAnimationFrame(tick);
    }
  }
  const stopListening = paused.listen(run);
  return {
    follow: (course: CourseValue) => {
      const before = namedBefore(course.active);
      const phase = restingPhase(course);
      if (phase === resting) {
        return;
      }
      entering = phase !== undefined && before < phase;
      const position = current();
      caught =
        resting === undefined || position === undefined ? caught : { phase: resting, position };
      resting = phase;
      elapsed = 0;
      run();
    },
    layers: (course: CourseValue): FilmLayer[] =>
      filmLayers({ course, rests, looping: current(), caught }),
    see: (inWindow: boolean) => {
      seen = inWindow;
      run();
    },
    stop: () => {
      stopListening();
      cancelAnimationFrame(clock);
    },
  };
}
