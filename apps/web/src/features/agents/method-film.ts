import type { WheelFilmSource } from "@repo/ui/agents/wheel-film-layer";

const FILM = `${process.env.NEXT_PUBLIC_BASE_PATH}/media/agents/method-film`;
/* The paper film, end to end: the handshake's idle loop (the red thread loosens and ties again, frames 1 to 41), the
   morph into the brick wall (42 to 113, the red brick laid and tapped flat at its end), the morph into the bonsai (114
   to 172), the bonsai's idle loop (a breeze through its crown, 173 to 188), and Immersion's entrance (a sheet comes
   down and folds into the handshake, 189 to 223). Footage plays at its own pace: these are its seconds. */
const FRAMES = 223;
/* Seconds a phase rests before its loop plays: its copy has come in by then. */
const SETTLE = 1.2;

/* The method wheel's film: the scroll folds the paper from one phase's `pose` to the next, done as the next phase is
   named; Immersion's `entrance` plays once as it comes in from the question; while the wheel rests on a phase, its idle
   `loop` plays in time, never with the scroll. Each still is cut from its phase's pose. */
export const agentsMethodFilm: WheelFilmSource = {
  frames: Array.from(
    { length: FRAMES },
    (_, index) => `${FILM}/${String(index + 1).padStart(4, "0")}.avif`,
  ),
  rests: [
    {
      pose: 40,
      entrance: { from: 188, to: 222, seconds: 4.3 },
      loop: { from: 0, to: 40, seconds: 5, hold: 3, delay: SETTLE, motion: "repeat" },
    },
    {
      pose: 112,
      loop: { from: 107, to: 112, seconds: 0.45, hold: 3.5, delay: SETTLE, motion: "bounce" },
    },
    {
      pose: 171,
      loop: { from: 171, to: 187, seconds: 5, hold: 2, delay: SETTLE, motion: "repeat" },
    },
  ],
  labels: { pause: "Mettre l’animation en pause", play: "Relancer l’animation" },
};
