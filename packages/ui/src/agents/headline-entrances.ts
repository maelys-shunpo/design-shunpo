import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

import { ease } from "../motion/tokens.ts";

gsap.registerPlugin(SplitText);

/* One headline entrance: `build` makes its timeline (paused or played by the caller), `revert` kills it and gives the
   headline back as plain text. */
export interface Entrance {
  build: () => gsap.core.Timeline;
  revert: () => void;
}

/* The section titles' entrance (the spec's values): each line starts below its own mask, leaning 4°, and rises
   straightening as it lands; once the lines are down the masks let content reach past them. */
const LINE_FROM = { yPercent: 115, rotate: 4, transformOrigin: "0% 100%" };
const LINE_FOR = 0.9;
const LINE_STAGGER = 0.09;
const MASKS_FREE_AT = 0.95;

export function linesEntrance(headline: HTMLElement): Entrance {
  const split = SplitText.create(headline, {
    type: "lines",
    mask: "lines",
    /* Whitespace kept as written: collapsing it would turn narrow no-break spaces into breaking ones. */
    reduceWhiteSpace: false,
  });
  for (const line of split.lines) {
    if (line instanceof HTMLElement) {
      line.dataset["entranceLine"] = "";
    }
  }
  let timeline: gsap.core.Timeline | undefined;
  return {
    build: () => {
      timeline = gsap
        .timeline()
        .fromTo(split.lines, LINE_FROM, {
          yPercent: 0,
          rotate: 0,
          duration: LINE_FOR,
          ease: ease.emphasized,
          stagger: LINE_STAGGER,
          force3D: false,
        })
        .set(split.masks, { overflow: "visible" }, MASKS_FREE_AT);
      return timeline;
    },
    revert: () => {
      timeline?.kill();
      split.revert();
    },
  };
}

/* The closing call's entrance (the spec's values): split into words then letters, each letter behind its own mask, so
   a word is never cut at a line's end; every letter rises from behind its edge, 0.018 s after the one before. */
const LETTER_FOR = 0.7;
const LETTER_STAGGER = 0.018;

export function lettersEntrance(headline: HTMLElement): Entrance {
  const split = SplitText.create(headline, {
    type: "lines,words,chars",
    mask: "chars",
    reduceWhiteSpace: false,
  });
  for (const letter of split.chars) {
    if (letter instanceof HTMLElement) {
      letter.dataset["entranceLetter"] = "";
    }
  }
  for (const line of split.lines) {
    if (line instanceof HTMLElement) {
      line.dataset["entranceLine"] = "";
    }
  }
  let timeline: gsap.core.Timeline | undefined;
  return {
    build: () => {
      timeline = gsap.timeline().fromTo(
        split.chars,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: LETTER_FOR,
          ease: ease.emphasized,
          stagger: LETTER_STAGGER,
          force3D: false,
        },
      );
      return timeline;
    },
    revert: () => {
      timeline?.kill();
      split.revert();
    },
  };
}
