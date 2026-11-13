import { frameAround } from "../lib/frame-jump.ts";
import {
  answerRise,
  cutProgress,
  cutScale,
  designatedAt,
  inkWordClose,
  inkWordFocus,
  NIGHT_ENTER_SCREENS,
  plateFrame,
  questionDim,
  questionRise,
} from "../motion/question-geometry.ts";
import { CUT_TURN_DEGREES, coverScale, cutTurn, nightClip } from "../motion/shuriken-geometry.ts";
import { type TravellingFrame, travellingFrame } from "../motion/travelling-frame.ts";

/* The night arrives as a card around the question and grows to the screen in the first half screen of the hold. */
const CARD = { width: 1200, height: 400 };
const CARD_HEIGHT_SHARE = 0.45;
const CARD_GUTTER = 16;
const CARD_CORNER = 14;
const COVER_MARGIN = 1.01;
/* How far below its place each plate starts, in px. */
const PLATE_REACH = 56;
/* The question and its plates keep a margin of the screen and clear the floating nav (the same room below, since they
   are centred); on a short screen they shrink to fit. */
const SCREEN_SHARE = 0.9;
const NAV_CLEARANCE = 96;
const LINE_BELOW_PERCENT = 105;
const PARAGRAPH_BELOW_PX = 24;
/* The answer's lines rise out of their masks from `sm`. */
const BY_LINE = "(min-width: 40rem)";
/* How far the travelling frame stands off a plate. */
const PLATE_PAD = 8;
/* The keyword's entrance, as in the method's title: how blurred it starts, in px, and how far outside it each
   bracket starts, in em. */
const INK_BLUR_PX = 14;
const INK_BRACKETS_FROM_EM = 0.35;
/* The keyword is there, faint and blurred, as soon as its line rises: the line never reads with a hole in it. */
const INK_FAINT = 0.3;

/* Writes inline styles on a part of the scene: the course paints them every frame, no stylesheet could. */
function paint(element: HTMLElement, styles: Record<string, string>) {
  for (const [property, value] of Object.entries(styles)) {
    element.style.setProperty(property, value);
  }
}

interface Parts {
  stage: HTMLElement;
  night: HTMLElement;
  content: HTMLElement;
  question: HTMLElement | null;
  plates: HTMLElement[];
  lines: HTMLElement[];
  paragraphs: HTMLElement[];
  frame: HTMLElement | null;
  /* The answer's keyword (`InkWord`), when it has one: its text and its two brackets. */
  ink: { text: HTMLElement; brackets: HTMLElement[] } | undefined;
}

interface Measures {
  width: number;
  height: number;
  cover: number;
  byLine: boolean;
  /* How far below its place the question stands in the middle of the night, in the content's own px. */
  questionDrop: number;
  /* How far outside the keyword its brackets start, in px. */
  inkReach: number;
}

function partsOf(stage: HTMLElement): Parts | undefined {
  const night = stage.querySelector<HTMLElement>("[data-question-night]");
  const content = stage.querySelector<HTMLElement>("[data-question-content]");
  if (night === null || content === null) {
    return undefined;
  }
  return {
    stage,
    night,
    content,
    question: stage.querySelector<HTMLElement>("[data-question-text]"),
    plates: [...stage.querySelectorAll<HTMLElement>("[data-question-plate]")],
    lines: [...stage.querySelectorAll<HTMLElement>("[data-statement-line]")],
    paragraphs: [...stage.querySelectorAll<HTMLElement>("[data-statement-paragraph]")],
    frame: stage.querySelector<HTMLElement>("[data-question-frame]"),
    ink: inkOf(stage),
  };
}

function inkOf(stage: HTMLElement): Parts["ink"] {
  const word = stage.querySelector<HTMLElement>("[data-statement-paragraph] [data-slot=ink-word]");
  const text = word?.querySelector<HTMLElement>("[data-ink-text]");
  if (word === null || text === null || text === undefined) {
    return undefined;
  }
  return { text, brackets: [...word.querySelectorAll<HTMLElement>("[data-ink-bracket]")] };
}

/* Moves the travelling frame onto the plate the course designates, hidden before the first and from the cut on. */
function designate(frame: TravellingFrame, parts: Parts, screens: number) {
  const designated = designatedAt(screens);
  const plate = designated === undefined ? undefined : parts.plates[designated.index];
  if (designated === undefined || plate === undefined) {
    frame.hide();
    return;
  }
  const origin = parts.stage.getBoundingClientRect();
  frame.show(
    `plate-${String(designated.index)}`,
    frameAround(plate.getBoundingClientRect(), origin, PLATE_PAD),
    { tone: "night" },
  );
}

/* The keyword comes into focus as its line lands, then its brackets close on it from outside. */
function paintInk({ ink, lines }: Parts, screens: number, reach: number) {
  if (ink === undefined) {
    return;
  }
  const focus = inkWordFocus(screens, lines.length);
  const close = inkWordClose(screens, lines.length);
  paint(ink.text, {
    filter: `blur(${String(INK_BLUR_PX * (1 - focus))}px)`,
    opacity: String(INK_FAINT + (1 - INK_FAINT) * focus),
  });
  ink.brackets.forEach((bracket, side) => {
    const away = (side === 0 ? -reach : reach) * (1 - close);
    paint(bracket, { translate: `${String(away)}px`, opacity: String(close) });
  });
}

/* Fits the question and its plates to the screen, then measures how far the question's place (its own and the
   plates' offsets cleared) stands above the middle of the night. */
function measure({ night, content, question, plates, ink }: Parts): Measures {
  const [width, height] = [night.clientWidth, night.clientHeight];
  const room = Math.min(height * SCREEN_SHARE, height - 2 * NAV_CLEARANCE);
  const scale = Math.min(1, room / content.offsetHeight);
  paint(content, { scale: String(scale) });
  for (const part of question === null ? plates : [question, ...plates]) {
    paint(part, { translate: "", scale: "" });
  }
  const box = night.getBoundingClientRect();
  const place = question?.getBoundingClientRect();
  const questionDrop =
    place === undefined ? 0 : (box.top + box.height / 2 - (place.top + place.height / 2)) / scale;
  return {
    width,
    height,
    cover: coverScale(width, height, CUT_TURN_DEGREES) * COVER_MARGIN,
    byLine: window.matchMedia(BY_LINE).matches,
    questionDrop,
    inkReach:
      ink === undefined
        ? 0
        : Number(getComputedStyle(ink.text).fontSize.replace("px", "")) * INK_BRACKETS_FROM_EM,
  };
}

interface Moment {
  /* 0: a card around the question; 1: the whole screen. */
  enter: number;
  /* Screens of the question's course. */
  screens: number;
}

function paintNight(night: HTMLElement, { enter, screens }: Moment, measures: Measures) {
  const progress = cutProgress(screens);
  if (progress >= 1) {
    paint(night, { "clip-path": "inset(50%)" });
    return;
  }
  const { width, height } = measures;
  const clip = nightClip(width, height, {
    enter,
    card: {
      width: Math.min(CARD.width, width - 2 * CARD_GUTTER),
      height: Math.min(CARD.height, height * CARD_HEIGHT_SHARE),
    },
    corner: CARD_CORNER,
    scale: progress <= 0 ? 0 : cutScale(progress, measures),
    degrees: cutTurn(progress),
  });
  paint(night, { "clip-path": clip });
}

function paintAnswer({ lines, paragraphs }: Parts, screens: number, byLine: boolean) {
  if (byLine) {
    lines.forEach((line, index) => {
      const rise = answerRise(screens, index);
      /* Unseen until it starts to rise: at a line height of 1 its ascenders reach above the line, out of its mask. */
      paint(line, {
        translate: `0 ${String(LINE_BELOW_PERCENT * (1 - rise))}%`,
        opacity: rise > 0 ? "1" : "0",
      });
    });
    return;
  }
  paragraphs.forEach((paragraph, index) => {
    const rise = answerRise(screens, index);
    paint(paragraph, {
      translate: `0 ${String(PARAGRAPH_BELOW_PX * (1 - rise))}px`,
      opacity: String(rise),
    });
  });
}

/* The question's course over `hold` screens of a held stage: the night opens around the question, the question rises
   to the top and the plates rise into place under it (the travelling frame designates each in turn), the shuriken cuts the night away and the answer rises on
   the paper beneath (its keyword comes into focus and its brackets close on it). Returns the painter for a point of the hold, in
   screens; it measures again whenever the stage changes size. */
export function questionCourse(
  stage: HTMLElement,
  nightEnter = NIGHT_ENTER_SCREENS,
): ((held: number) => void) | undefined {
  const parts = partsOf(stage);
  if (parts === undefined) {
    return undefined;
  }
  let measures = measure(parts);
  const travelling =
    parts.frame === null ? undefined : travellingFrame(stage, parts.frame, "data-question-ghost");
  return (held: number) => {
    if (
      parts.night.clientWidth !== measures.width ||
      parts.night.clientHeight !== measures.height
    ) {
      measures = measure(parts);
    }
    const enter = nightEnter <= 0 ? 1 : Math.min(1, held / nightEnter);
    const screens = Math.max(0, held - nightEnter);
    paintNight(parts.night, { enter, screens }, measures);
    parts.plates.forEach((plate, index) => {
      const frame = plateFrame(screens, index, PLATE_REACH);
      paint(plate, {
        translate: `0 ${String(frame.y)}px`,
        scale: String(frame.scale),
        opacity: String(frame.opacity),
      });
    });
    if (parts.question !== null) {
      paint(parts.question, {
        translate: `0 ${String(measures.questionDrop * (1 - questionRise(screens)))}px`,
        opacity: String(1 - questionDim(screens)),
      });
    }
    paintAnswer(parts, screens, measures.byLine);
    paintInk(parts, screens, measures.inkReach);
    /* Last, so the frame measures every part where this point of the course puts it. */
    if (travelling !== undefined) {
      designate(travelling, parts, screens);
    }
  };
}
