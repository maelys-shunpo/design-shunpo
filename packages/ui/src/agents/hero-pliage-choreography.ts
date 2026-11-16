import { ease } from "../motion/tokens.ts";
import { finalPlacement } from "./hero-pliage-geometry.ts";
import {
  FINAL_TURN,
  type FlapAttributes,
  POSTER_SIGN,
  posterSheet,
  type SheetAttributes,
  sheetAttributes,
  type SheetState,
  signAttributes,
  type SignState,
} from "./hero-pliage-state.ts";

/* Shares of the scene (0 to 1), three windows of scroll. One sheet folds at a time, its right flap then its
   left; the kites lift off and fly to the star one after another; the pebble slides in under them, the hole goes
   through, the star takes its instant step, and the caption turns. A long rest closes the scene. */
const FOLD = { at: 0.04, gap: 0.085, span: 0.075, second: 0.04 };
const FLIGHT = { at: 0.42, gap: 0.045, span: 0.17, rise: 0.45 };
const LABEL_EXIT = 0.04;
const PEBBLE = { at: 0.7, span: 0.08 };
const HOLE = { at: 0.77, span: 0.05 };
const TURN = { at: 0.82, span: 0.03 };
const WORD = { arrive: 0.73, at: 0.86, span: 0.05 };
/* How far the caption's words travel as they swap, in the figure's units. */
const WORD_TRAVEL = 14;

type Side = "right" | "left";

interface SheetParts {
  root: SVGElement;
  label: Element | null;
  mark: Element | null;
  lift: Element | null;
  flaps: Record<Side, Element | null>;
  light: Record<Side, Element | null>;
  shade: Record<Side, Element | null>;
  cast: Record<Side, Element | null>;
  creases: Record<Side, Element | null>;
  axis: Element | null;
  ridge: Element | null;
}

interface Sheet {
  parts: SheetParts;
  state: SheetState;
  index: number;
}

/* Everything the sign's moments write to: the figure, the star's own state and the sheets that turn with it. */
interface Story {
  figure: Element;
  sign: SignState;
  sheets: Sheet[];
}

function bySide(root: Element, selector: (side: Side) => string): Record<Side, Element | null> {
  return {
    right: root.querySelector(selector("right")),
    left: root.querySelector(selector("left")),
  };
}

/* Every element a sheet writes to, found once when the timeline is built. */
function sheetParts(figure: Element, root: SVGElement): SheetParts {
  const index = root.dataset["pliageSheet"] ?? "";
  return {
    root,
    label: figure.querySelector(`[data-pliage-label='${index}']`),
    mark: root.querySelector("[data-pliage-mark]"),
    lift: root.querySelector("[data-pliage-lift]"),
    flaps: bySide(root, (side) => `[data-pliage-flap='${side}']`),
    light: bySide(root, (side) => `[data-pliage-flap='${side}'] [data-pliage-face='light']`),
    shade: bySide(root, (side) => `[data-pliage-flap='${side}'] [data-pliage-face='shade']`),
    cast: bySide(root, (side) => `[data-pliage-cast='${side}']`),
    creases: bySide(root, (side) => `[data-pliage-crease='${side}']`),
    axis: root.querySelector("[data-pliage-axis]"),
    ridge: root.querySelector("[data-pliage-ridge]"),
  };
}

function writeFlap(parts: SheetParts, side: Side, attributes: SheetAttributes): void {
  const flap: FlapAttributes = attributes[side];
  parts.flaps[side]?.setAttribute("transform", flap.transform);
  parts.light[side]?.setAttribute("opacity", flap.light);
  parts.shade[side]?.setAttribute("opacity", flap.shade);
  parts.cast[side]?.setAttribute("opacity", flap.cast);
  parts.creases[side]?.setAttribute(
    "opacity",
    side === "right" ? attributes.rightCrease : attributes.leftCrease,
  );
}

function writeSheet({ parts, state }: Sheet, starTurn: number): void {
  const attributes: SheetAttributes = sheetAttributes(state, starTurn);
  parts.root.setAttribute("transform", attributes.transform);
  writeFlap(parts, "right", attributes);
  writeFlap(parts, "left", attributes);
  parts.axis?.setAttribute("opacity", attributes.axis);
  parts.ridge?.setAttribute("opacity", attributes.ridge);
  parts.label?.setAttribute("opacity", attributes.label);
  parts.mark?.setAttribute("transform", attributes.mark);
  parts.lift?.setAttribute("transform", attributes.liftShadow.transform);
  parts.lift?.setAttribute("opacity", attributes.liftShadow.opacity);
}

/* One sheet's story: its two folds while it leads, then its flight to its branch on an arc (x and y on different
   eases), turning and shrinking from the table's size to the star's. It lifts off the table as it leaves, its
   shadow coming loose, and settles back as it lands; its name stays on the table. */
function foldAndFly(timeline: gsap.core.Timeline, sheet: Sheet, sign: SignState): void {
  const { state, index } = sheet;
  const target = finalPlacement(index);
  function write(): void {
    writeSheet(sheet, sign.turn);
  }
  const fold = FOLD.at + index * FOLD.gap;
  const fly = FLIGHT.at + index * FLIGHT.gap;
  const rise = FLIGHT.span * FLIGHT.rise;
  timeline
    .to(state, { right: 1, duration: FOLD.span, ease: ease.inOut, onUpdate: write }, fold)
    .to(
      state,
      { left: 1, duration: FOLD.span, ease: ease.inOut, onUpdate: write },
      fold + FOLD.second,
    )
    .to(state, { label: 0, duration: LABEL_EXIT, ease: ease.exit, onUpdate: write }, fly)
    .to(state, { lift: 1, duration: rise, ease: ease.standard, onUpdate: write }, fly)
    .to(
      state,
      { lift: 0, duration: FLIGHT.span - rise, ease: ease.inOut, onUpdate: write },
      fly + rise,
    )
    .to(state, { x: target.x, duration: FLIGHT.span, ease: ease.inOut, onUpdate: write }, fly)
    .to(state, { y: target.y, duration: FLIGHT.span, ease: ease.standard, onUpdate: write }, fly)
    .to(
      state,
      { turn: target.turn, scale: 1, duration: FLIGHT.span, ease: ease.inOut, onUpdate: write },
      fly,
    );
}

/* The sign forms: the pebble slides in from the right under the star, the hole goes through it, and the star
   takes a sharp quarter turn, carrying each tool to the next branch while its mark stays upright. */
function formSign(timeline: gsap.core.Timeline, { figure, sign, sheets }: Story): void {
  const pebble = figure.querySelector("[data-pliage='pebble']");
  const hole = figure.querySelector("[data-pliage='hole']");
  const star = figure.querySelector("[data-pliage='star']");
  function write(): void {
    const attributes = signAttributes(sign);
    pebble?.setAttribute("transform", attributes.pebble.transform);
    pebble?.setAttribute("opacity", attributes.pebble.opacity);
    hole?.setAttribute("transform", attributes.hole);
    star?.setAttribute("transform", attributes.star);
    for (const sheet of sheets) {
      writeSheet(sheet, sign.turn);
    }
  }
  timeline
    .to(
      sign,
      { pebble: 1, duration: PEBBLE.span, ease: ease.emphasized, onUpdate: write },
      PEBBLE.at,
    )
    .to(sign, { hole: 1, duration: HOLE.span, ease: ease.emphasized, onUpdate: write }, HOLE.at)
    .to(
      sign,
      { turn: FINAL_TURN, duration: TURN.span, ease: ease.emphasized, onUpdate: write },
      TURN.at,
    );
}

/* The caption arrives under the gathered kites, then its last word rises out as the next one rises in. */
function turnCaption(timeline: gsap.core.Timeline, figure: Element): void {
  const before = figure.querySelector("[data-pliage-word='before']");
  const after = figure.querySelector("[data-pliage-word='after']");
  timeline
    .fromTo(
      before,
      { y: WORD_TRAVEL, opacity: 0 },
      { y: 0, opacity: 1, duration: WORD.span, ease: ease.standard },
      WORD.arrive,
    )
    .to(before, { y: -WORD_TRAVEL, opacity: 0, duration: WORD.span / 2, ease: ease.exit }, WORD.at)
    .fromTo(
      after,
      { y: WORD_TRAVEL, opacity: 0 },
      { y: 0, opacity: 1, duration: WORD.span, ease: ease.standard },
      WORD.at + WORD.span / 4,
    );
}

/* The scene of « Pliage », written on the timeline its ScrollScene scrubs: progress 0 is the painted table. */
export function pliageChoreography(timeline: gsap.core.Timeline, scene: HTMLElement): void {
  const figure = scene.querySelector("[data-pliage-animated]");
  if (figure === null) {
    return;
  }
  const sign: SignState = { ...POSTER_SIGN };
  const sheets: Sheet[] = [...figure.querySelectorAll<SVGGElement>("[data-pliage-sheet]")].map(
    (root, index) => ({ parts: sheetParts(figure, root), state: posterSheet(index), index }),
  );
  for (const sheet of sheets) {
    foldAndFly(timeline, sheet, sign);
  }
  formSign(timeline, { figure, sign, sheets });
  turnCaption(timeline, figure);
  timeline.set({}, {}, 1);
}
