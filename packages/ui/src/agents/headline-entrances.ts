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
