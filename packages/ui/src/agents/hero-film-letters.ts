import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/* Splits each risen word of the promise into the letters the sunlight climbs (`data-hero-film='letter'`, read by
   `heroFilmCourse`), keeping the words' text and the heading's accessible name. Returns a revert that gives the promise
   back as whole words. Loaded only by the lazy hero-film scene (and its test), never on the first paint, so GSAP and
   SplitText stay off the critical path. */
export function splitPromiseLetters(stage: HTMLElement): () => void {
  const rises = [...stage.querySelectorAll<HTMLElement>("[data-hero-film='rise']")];
  const split = SplitText.create(rises, {
    type: "chars",
    charsClass: "agents-hero-letter",
    reduceWhiteSpace: false,
  });
  for (const letter of split.chars) {
    if (letter instanceof HTMLElement) {
      letter.dataset["heroFilm"] = "letter";
    }
  }
  return () => {
    split.revert();
  };
}
