import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

import { duration, ease, stagger } from "../motion/tokens.ts";

gsap.registerPlugin(SplitText);

/* The beat between two steps of a live interface, and how long a transient piece stays. */
const STEP_GAP = 0.55;
const TRANSIENT_STAY = 1.1;
const LETTER = 0.016;
const LEAD_IN = 0.2;

export interface LiveScript {
  timeline: gsap.core.Timeline;
  /* The time at which every piece is shown: the state the page painted. */
  finished: number;
  revert: () => void;
}

interface Script {
  timeline: gsap.core.Timeline;
  splits: SplitText[];
}

function ordered(root: Element): HTMLElement[][] {
  const groups = new Map<number, HTMLElement[]>();
  for (const piece of root.querySelectorAll<HTMLElement>("[data-live]")) {
    const order = Number(piece.dataset["live"]);
    groups.set(order, [...(groups.get(order) ?? []), piece]);
  }
  return [...groups.entries()]
    .toSorted(([first], [second]) => first - second)
    .map(([, group]) => group);
}

function typeIn({ timeline, splits }: Script, piece: HTMLElement, at: number): number {
  const split = SplitText.create(piece, { type: "words,chars", aria: "none" });
  splits.push(split);
  /* Letters type in one by one, but a line only ever breaks between words. */
  gsap.set(split.words, { display: "inline-block", whiteSpace: "nowrap" });
  timeline.from(split.chars, { autoAlpha: 0, duration: 0.01, stagger: LETTER }, at);
  return split.chars.length * LETTER;
}

function enter(script: Script, piece: HTMLElement, at: number): number {
  const { timeline } = script;
  const kind = piece.dataset["liveKind"];
  if (kind === "type") {
    return typeIn(script, piece, at);
  }
  if (kind === "grow") {
    timeline.from(
      piece,
      { scaleX: 0, transformOrigin: "0% 50%", duration: duration.slow, ease: ease.inOut },
      at,
    );
    return duration.slow;
  }
  if (kind === "transient") {
    /* Authored out of the flow (hidden): it takes its place only while it shows. */
    timeline.set(piece, { display: "inline-flex", autoAlpha: 0 }, at);
    timeline.to(piece, { autoAlpha: 1, duration: duration.fast }, at);
    timeline.to(piece, { autoAlpha: 0, duration: duration.fast }, at + TRANSIENT_STAY);
    timeline.set(piece, { display: "none" }, at + TRANSIENT_STAY + duration.fast);
    return TRANSIENT_STAY;
  }
  timeline.from(piece, { autoAlpha: 0, y: 10, duration: duration.base, ease: ease.emphasized }, at);
  return duration.base;
}

function playGroup(script: Script, group: HTMLElement[], start: number): number {
  const lengths = group.map((piece, index) => enter(script, piece, start + index * stagger.tight));
  return start + Math.max(...lengths) + STEP_GAP;
}

/* Every piece hidden at the start, revealed step by step, held finished, then faded before the next loop. */
export function buildLiveScript(root: Element, hold: number): LiveScript {
  const script: Script = { timeline: gsap.timeline({ paused: true, repeat: -1 }), splits: [] };
  const finished = ordered(root).reduce((at, group) => playGroup(script, group, at), LEAD_IN);
  const shown = root.querySelectorAll("[data-live]:not([data-live-kind=transient])");
  script.timeline.to(
    shown,
    { autoAlpha: 0, duration: duration.base, ease: ease.standard },
    finished + hold,
  );
  script.timeline.set({}, {}, finished + hold + duration.base + LEAD_IN);
  return {
    timeline: script.timeline,
    finished,
    revert: () => {
      script.timeline.kill();
      gsap.set(shown, { clearProps: "opacity,visibility,transform" });
      for (const split of script.splits) {
        split.revert();
      }
    },
  };
}
