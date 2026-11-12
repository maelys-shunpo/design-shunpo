import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

import { STAR } from "../brand/shuriken-paths.ts";
import { ease } from "../motion/tokens.ts";
import { type Entrance, linesEntrance } from "./headline-entrances.ts";

/* The throw (the spec's values): the star, 0.42 em, leaves before the first word and crosses the line spinning 0.9° a
   pixel, fast at first and slowing all the way, each word standing as it passes; over its last 3.2 sizes it shrinks to
   22 %. The run takes 0.00024 s a pixel, within [0.6, 1.4] s, and the whole plays at the chosen ×0.4 pace. */
const STAR_SIZE = 0.42;
const STAR_BOX = "19 23 116.4 119.6";
const SPIN_A_PIXEL = 0.9;
const SECONDS_A_PIXEL = 0.00024;
const RUN_WITHIN: [number, number] = [0.6, 1.4];
const SHRINK_SIZES = 3.2;
const SHRUNK = 0.22;
const PACE = 0.4;
const WORD_FOR = 0.55;
const WORD_RISE = 0.22;
/* The star sets off 2.25 sizes before the first word and, on a full stop, drops over the line's last 30 %. */
const LEAD = 2.25;
const DROP_FROM = 0.7;
const WORD_LEAN = -8;

interface Runway {
  from: number;
  to: number;
  mid: number;
  dotDrop: number;
  /* The distance run before the star starts dropping onto the full stop. */
  dropAt: number;
}

function starFor(headline: HTMLElement, size: number): SVGSVGElement {
  const star = headline.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
  star.setAttribute("viewBox", STAR_BOX);
  star.setAttribute("aria-hidden", "true");
  star.dataset["throwStar"] = "";
  star.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;fill:var(--color-agents-signal);pointer-events:none`;
  const path = headline.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", STAR);
  path.setAttribute("fill-rule", "evenodd");
  star.append(path);
  return star;
}

function fontSizeOf(headline: HTMLElement): number {
  return Number(getComputedStyle(headline).fontSize.replace("px", ""));
}

/* The full stop the star lands on, split out of the last word; null when the title ends on no full stop. */
function dotOf(words: Element[]): HTMLElement | null {
  const last = words.at(-1);
  if (!(last instanceof HTMLElement) || !(last.textContent ?? "").endsWith(".")) {
    return null;
  }
  const text = last.textContent ?? "";
  last.textContent = text.slice(0, -1);
  const dot = last.ownerDocument.createElement("span");
  dot.textContent = ".";
  last.append(dot);
  return dot;
}

/* Where the star runs, against the headline's box: from before the first word to the full stop's centre, or just past
   the last word; on a title with a full stop it eases down onto the baseline over the run's last stretch. */
function runwayOf(headline: HTMLElement, words: Element[], dot: HTMLElement | null): Runway {
  const box = headline.getBoundingClientRect();
  const first = words[0]?.getBoundingClientRect() ?? box;
  const size = fontSizeOf(headline) * STAR_SIZE;
  const from = first.left - box.left - size * LEAD;
  const lineStart = from + size * (LEAD - 0.9);
  const mid = first.top - box.top + first.height * 0.56 - size / 2;
  if (dot !== null) {
    const at = dot.getBoundingClientRect();
    const to = at.left + at.width / 2 - box.left - size / 2;
    return {
      from,
      to,
      mid,
      dotDrop: at.top + at.height * 0.72 - box.top - size / 2 - mid,
      dropAt: lineStart - from + (to - lineStart) * DROP_FROM,
    };
  }
  const lasts = words.map((word) => word.getBoundingClientRect().right);
  const to = Math.max(...lasts) - box.left + size * 0.35;
  return { from, to, mid, dotDrop: 0, dropAt: to - from };
}

/* The time at which the throw has covered a share of its run (the ease inverted). */
function timeAt(share: number, travel: number): number {
  const curve = gsap.parseEase("throw");
  let low = 0;
  let high = 1;
  for (let steps = 0; steps < 30; steps += 1) {
    const middle = (low + high) / 2;
    if (curve(middle) < share) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return low * travel;
}

/* The star in flight: what it is, where it runs and how big it is. */
interface Flight {
  star: SVGSVGElement;
  runway: Runway;
  size: number;
}

function placeStar({ star, runway, size }: Flight, progress: number): void {
  const run = runway.to - runway.from;
  const gone = progress * run;
  const drop =
    gone <= runway.dropAt ? 0 : (gone - runway.dropAt) / Math.max(1, run - runway.dropAt);
  const shrinkFrom = Math.max(0, run - size * SHRINK_SIZES);
  const shrink = gone <= shrinkFrom ? 0 : (gone - shrinkFrom) / (run - shrinkFrom);
  gsap.set(star, {
    x: runway.from + gone,
    y: runway.mid + runway.dotDrop * drop * drop,
    rotation: gone * SPIN_A_PIXEL,
    scale: 1 - (1 - SHRUNK) * shrink * shrink,
    opacity: Math.min(1, gone / (size * 1.2)),
    force3D: false,
  });
}

/* One-line titles only: a probe split falls the entrance back to the rising lines when the title breaks. */
export function throwEntrance(headline: HTMLElement): Entrance {
  const probe = SplitText.create(headline, { type: "lines", reduceWhiteSpace: false });
  const broken = probe.lines.length > 1;
  probe.revert();
  if (broken) {
    return linesEntrance(headline);
  }
  const split = SplitText.create(headline, { type: "words", reduceWhiteSpace: false });
  for (const word of split.words) {
    if (word instanceof HTMLElement) {
      word.dataset["throwWord"] = "";
    }
  }
  const size = fontSizeOf(headline) * STAR_SIZE;
  const dot = dotOf(split.words);
  const runway = runwayOf(headline, split.words, dot);
  const star = starFor(headline, size);
  const stance = headline.style.position;
  headline.style.setProperty("position", "relative");
  headline.append(star);
  let timeline: gsap.core.Timeline | undefined;
  return {
    build: () => {
      timeline = buildThrow({ headline, star, runway, size, words: split.words, dot });
      /* How long the throw lasts at its pace, read by the tests. */
      star.dataset["entranceSeconds"] = String(timeline.duration() / timeline.timeScale());
      return timeline;
    },
    revert: () => {
      timeline?.kill();
      star.remove();
      split.revert();
      headline.style.setProperty("position", stance);
    },
  };
}

interface Throw {
  headline: HTMLElement;
  star: SVGSVGElement;
  runway: Runway;
  size: number;
  words: Element[];
  dot: HTMLElement | null;
}

function buildThrow({ headline, star, runway, size, words, dot }: Throw): gsap.core.Timeline {
  const run = runway.to - runway.from;
  const travel = gsap.utils.clamp(RUN_WITHIN[0], RUN_WITHIN[1], run * SECONDS_A_PIXEL);
  const drive = { progress: 0 };
  const flight = { star, runway, size };
  placeStar(flight, 0);
  const timeline = gsap.timeline().to(drive, {
    progress: 1,
    duration: travel,
    ease: "throw",
    onUpdate: () => {
      placeStar(flight, drive.progress);
    },
  });
  const box = headline.getBoundingClientRect();
  for (const word of words) {
    const at = word.getBoundingClientRect();
    const centre = at.left + at.width / 2 - box.left;
    const share = gsap.utils.clamp(0, 1, (centre - runway.from) / run);
    timeline.fromTo(
      word,
      {
        opacity: 0,
        y: fontSizeOf(headline) * WORD_RISE,
        rotate: WORD_LEAN,
        transformOrigin: "0% 100%",
      },
      { opacity: 1, y: 0, rotate: 0, duration: WORD_FOR, ease: ease.emphasized, force3D: false },
      Math.max(0, timeAt(share, travel) - 0.04),
    );
  }
  if (dot === null) {
    timeline.to(star, { opacity: 0, duration: 0.2, ease: "power1.out" }, travel - 0.04);
  } else {
    timeline
      .set(dot, { opacity: 0 }, 0)
      .to(dot, { opacity: 1, duration: 0.1, ease: "none" }, travel - 0.06)
      .to(star, { opacity: 0, duration: 0.1, ease: "none" }, travel - 0.02);
  }
  timeline.timeScale(PACE);
  return timeline;
}
