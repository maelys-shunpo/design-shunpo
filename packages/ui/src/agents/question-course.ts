import { answerRise, cutProgress, cutScale, plateFrame } from "../motion/question-geometry.ts";
import { CUT_TURN_DEGREES, coverScale, cutTurn, nightClip } from "../motion/shuriken-geometry.ts";

/* The night arrives as a card around the question and grows to the screen in the first half screen of the hold. */
const CARD = { width: 1200, height: 400 };
const CARD_HEIGHT_SHARE = 0.45;
const CARD_GUTTER = 16;
const CARD_CORNER = 14;
const COVER_MARGIN = 1.01;
const ENTER_SCREENS = 0.5;
/* Plates around the question arrive from further out and draw each other in; stacked, they arrive from closer. */
const PATH = {
  around: { reach: 120, press: 10 },
  stacked: { reach: 72, press: 0 },
} as const;
/* The question and its plates keep a margin of the screen and clear the floating nav (the same room below, since they
   are centred); on a short screen they shrink to fit. */
const SCREEN_SHARE = 0.9;
const NAV_CLEARANCE = 96;
const LINE_BELOW_PERCENT = 105;
const PARAGRAPH_BELOW_PX = 24;
/* The answer's lines rise out of their masks from `sm`; the plates stand around the question from `lg`. */
const BY_LINE = "(min-width: 40rem)";
const AROUND = "(min-width: 64rem)";

/* Writes inline styles on a part of the scene: the course paints them every frame, no stylesheet could. */
function paint(element: HTMLElement, styles: Record<string, string>) {
  for (const [property, value] of Object.entries(styles)) {
    element.style.setProperty(property, value);
  }
}

interface Parts {
  night: HTMLElement;
  content: HTMLElement;
  plates: HTMLElement[];
  lines: HTMLElement[];
  paragraphs: HTMLElement[];
}

interface Measures {
  width: number;
  height: number;
  cover: number;
  around: boolean;
  byLine: boolean;
  /* Each plate with the unit vector from its place towards the middle of the night. */
  ways: Array<{ plate: HTMLElement; direction: [number, number] }>;
}

function partsOf(stage: HTMLElement): Parts | undefined {
  const night = stage.querySelector<HTMLElement>("[data-question-night]");
  const content = stage.querySelector<HTMLElement>("[data-question-content]");
  if (night === null || content === null) {
    return undefined;
  }
  return {
    night,
    content,
    plates: [...stage.querySelectorAll<HTMLElement>("[data-question-plate]")],
    lines: [...stage.querySelectorAll<HTMLElement>("[data-statement-line]")],
    paragraphs: [...stage.querySelectorAll<HTMLElement>("[data-statement-paragraph]")],
  };
}

/* Fits the question and its plates to the screen, then measures each plate's way in from its place (its own offsets
   cleared, so a plate on its way is measured where it will stand). */
function measure({ night, content, plates }: Parts): Measures {
  const [width, height] = [night.clientWidth, night.clientHeight];
  const room = Math.min(height * SCREEN_SHARE, height - 2 * NAV_CLEARANCE);
  paint(content, { scale: String(Math.min(1, room / content.offsetHeight)) });
  for (const plate of plates) {
    paint(plate, { translate: "", scale: "" });
  }
  const box = night.getBoundingClientRect();
  const ways = plates.map((plate) => {
    const rect = plate.getBoundingClientRect();
    const [dx, dy] = [
      box.left + box.width / 2 - (rect.left + rect.width / 2),
      box.top + box.height / 2 - (rect.top + rect.height / 2),
    ];
    const length = Math.max(Math.hypot(dx, dy), 1);
    const direction: [number, number] = [dx / length, dy / length];
    return { plate, direction };
  });
  return {
    width,
    height,
    cover: coverScale(width, height, CUT_TURN_DEGREES) * COVER_MARGIN,
    around: window.matchMedia(AROUND).matches,
    byLine: window.matchMedia(BY_LINE).matches,
    ways,
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
      paint(line, {
        translate: `0 ${String(LINE_BELOW_PERCENT * (1 - answerRise(screens, index)))}%`,
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

/* The question's course over `hold` screens of a held stage: the night opens around the question, the plates arrive
   around it, the shuriken cuts the night away and the answer rises on the paper beneath. Returns the painter for a
   point of the hold, in screens; it measures again whenever the stage changes size. */
export function questionCourse(stage: HTMLElement): ((held: number) => void) | undefined {
  const parts = partsOf(stage);
  if (parts === undefined) {
    return undefined;
  }
  let measures = measure(parts);
  return (held: number) => {
    if (
      parts.night.clientWidth !== measures.width ||
      parts.night.clientHeight !== measures.height
    ) {
      measures = measure(parts);
    }
    const enter = Math.min(1, held / ENTER_SCREENS);
    const screens = Math.max(0, held - ENTER_SCREENS);
    paintNight(parts.night, { enter, screens }, measures);
    const path = measures.around ? PATH.around : PATH.stacked;
    measures.ways.forEach(({ plate, direction }, index) => {
      const frame = plateFrame(screens, index, { direction, ...path });
      paint(plate, {
        translate: `${String(frame.x)}px ${String(frame.y)}px`,
        scale: String(frame.scale),
        opacity: String(frame.opacity),
      });
    });
    paintAnswer(parts, screens, measures.byLine);
  };
}
