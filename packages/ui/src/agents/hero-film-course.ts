import { ease } from "../motion/tokens.ts";

/* The course of the hero film, in screens of scroll (`agents-film-hold`), as on the home page's approved 1,440 × 900
   frame: the film plays over 1,450 of the first 1,800 px and its last frame holds until the next section's sheet rises
   over the stage. */
export const FILM_SCREENS = (2 * 1450) / 1800;
export const HOLD_SCREENS = 2;

/* Piste A, « l'aube écrit la promesse ». The dawn climbs the promise letter by letter before the leave mark (`--lit`,
   0 → 1), then the risen sun overexposes it after (`--heat`, 0 → 1), both led by how near each letter sits to the sun
   below: the lowest and most central first. The light fills a touch before the leave mark so the phrase never lingers
   at half contrast; the overexposure is given a fifth of the film and the action fades over its first third. */
const LIGHT = { endBefore: 0.05, lead: 0.5 } as const;
const HEAT = { span: 0.18, lead: 0.5, action: 0.33 } as const;
/* The sun rises at the foot of the promise and at its centre: the vertical gap leads, the horizontal only nudges. */
const SUN = { vertical: 0.75, horizontal: 0.25 } as const;

export interface FilmCues {
  /* Film progress (0 to 1) from which the promise leaves the sky to the sun: the light is in by then, the burn begins. */
  leaveAt: number;
}

/* The lit promise: its letters, each letter's lead (0 first, 1 last) and the action that fades with the overexposure. */
interface Lit {
  action: HTMLElement | null;
  letters: HTMLElement[];
  leads: number[];
}

function part(stage: HTMLElement, name: string): HTMLElement | null {
  return stage.querySelector<HTMLElement>(`[data-hero-film='${name}']`);
}

/* Each letter's lead, 0 (first, nearest the sun) to 1 (last): mostly how low it sits, a little how central. Measured
   once the promise has its lines, so the light and the heat run up from the horizon as the reader sees it. */
function leadsOf(letters: readonly HTMLElement[]): number[] {
  const rects = letters.map((letter) => letter.getBoundingClientRect());
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const height = Math.max(bottom - top, 1);
  const half = Math.max((right - left) / 2, 1);
  const centre = (left + right) / 2;
  const raw = rects.map((rect) => {
    const low = (bottom - rect.bottom) / height;
    const side = Math.abs((rect.left + rect.right) / 2 - centre) / half;
    return low * SUN.vertical + side * SUN.horizontal;
  });
  const most = Math.max(...raw, 1);
  return raw.map((value) => value / most);
}

function litOf(stage: HTMLElement): Lit | undefined {
  if (part(stage, "call") === null) {
    return undefined;
  }
  const letters = [...stage.querySelectorAll<HTMLElement>("[data-hero-film='letter']")];
  return { action: part(stage, "action"), letters, leads: leadsOf(letters) };
}

/* The frame follows the course, the promise seeks the night's video. */
function playFilm(timeline: gsap.core.Timeline, seek: (share: number) => void): void {
  const film = { share: 0 };
  timeline.fromTo(
    film,
    { share: 0 },
    {
      share: 1,
      duration: FILM_SCREENS,
      ease: "none",
      onUpdate: () => {
        seek(film.share);
      },
    },
    0,
  );
}

/* The light climbs each letter from the horizon up: every letter lands lit a touch before the leave mark, the lowest
   starting first so the phrase brightens from its foot. */
function climb(timeline: gsap.core.Timeline, lit: Lit, leaveAt: number): void {
  const end = FILM_SCREENS * (leaveAt - LIGHT.endBefore);
  const stagger = end * LIGHT.lead;
  for (const [index, letter] of lit.letters.entries()) {
    const start = (lit.leads[index] ?? 0) * stagger;
    timeline.fromTo(
      letter,
      { "--lit": 0 },
      { "--lit": 1, duration: end - start, ease: "none" },
      start,
    );
  }
}

/* The overexposure runs from the leave mark, the lowest letters whitening first; the action fades over its first third
   so the sky takes the phrase back as one. */
function overexpose(timeline: gsap.core.Timeline, lit: Lit, leaveAt: number): void {
  const from = FILM_SCREENS * leaveAt;
  const window = FILM_SCREENS * HEAT.span;
  const stagger = window * HEAT.lead;
  if (lit.action !== null) {
    timeline.fromTo(
      lit.action,
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: window * HEAT.action, ease: ease.inOut },
      from,
    );
  }
  for (const [index, letter] of lit.letters.entries()) {
    const start = from + (lit.leads[index] ?? 0) * stagger;
    timeline.fromTo(
      letter,
      { "--heat": 0 },
      { "--heat": 1, duration: from + window - start, ease: "none" },
      start,
    );
  }
}

/* The hero film's timeline, `HOLD_SCREENS` long, scrubbed by the scroll across its hold: the film's frame, the promise
   lit from the horizon then overexposed by the sun, the last frame held. */
export function heroFilmCourse(
  stage: HTMLElement,
  cues: FilmCues,
  seek: (share: number) => void,
): (timeline: gsap.core.Timeline) => void {
  return (timeline) => {
    const lit = litOf(stage);
    if (lit === undefined) {
      return;
    }
    playFilm(timeline, seek);
    climb(timeline, lit, cues.leaveAt);
    overexpose(timeline, lit, cues.leaveAt);
    timeline.set({}, {}, HOLD_SCREENS);
  };
}
