import { gsap } from "gsap";

import { ease } from "../motion/tokens.ts";

/* The roll (the spec's values): the first digit's column rolls a full turn and stops on its value in 1.1 s, each digit
   after it 0.25 s longer, so they stop left to right; the other signs rise and fade up from 0.1 s. */
const FIRST_ROLL = 1.1;
const ROLL_MORE = 0.25;
const ROLL_EASE = "power3.out";
const GLYPHS_AT = 0.1;
const GLYPH_FOR = 0.6;
const GLYPH_STAGGER = 0.08;

const WHEEL_STYLE = "position:relative;display:inline-block;overflow:hidden;height:1em";
const COLUMN_STYLE =
  "position:absolute;inset-inline:0;top:0;display:flex;flex-direction:column;align-items:center";

interface Wheel {
  column: HTMLElement;
  steps: number;
}

/* A digit's window: one digit tall, as wide as its final digit, a column of `10 + digit + 1` digits behind it. */
function wheelFor(digit: string, document: Document): { wheel: HTMLElement; steps: number } {
  const wheel = document.createElement("span");
  wheel.dataset["figureWheel"] = "";
  wheel.style.cssText = WHEEL_STYLE;
  const sizer = document.createElement("span");
  sizer.style.visibility = "hidden";
  sizer.textContent = digit;
  const column = document.createElement("span");
  column.dataset["figureColumn"] = "";
  column.style.cssText = COLUMN_STYLE;
  const steps = 10 + Number(digit);
  for (let turn = 0; turn <= steps; turn += 1) {
    const cell = document.createElement("span");
    cell.style.cssText = "height:1em;line-height:1";
    cell.textContent = String(turn % 10);
    column.append(cell);
  }
  wheel.append(sizer, column);
  return { wheel, steps };
}

interface Carved {
  wheels: Wheel[];
  glyphs: HTMLElement[];
}

/* One sign of the face: a wheel for a digit, an inline-block glyph for anything else. */
function pieceFor(sign: string, document: Document, carved: Carved) {
  if (/\d/u.test(sign)) {
    const { wheel, steps } = wheelFor(sign, document);
    const column = wheel.querySelector<HTMLElement>("[data-figure-column]");
    if (column !== null) {
      carved.wheels.push({ column, steps });
    }
    return wheel;
  }
  const glyph = document.createElement("span");
  glyph.dataset["figureGlyph"] = "";
  glyph.style.display = "inline-block";
  glyph.textContent = sign;
  carved.glyphs.push(glyph);
  return glyph;
}

/* Rebuilds the face's text in place: every digit becomes a wheel, every other sign a glyph, inside their own spans so
   the figure's and the unit's sizes hold. */
function carveFace(face: HTMLElement): Carved {
  const carved: Carved = { wheels: [], glyphs: [] };
  const walker = face.ownerDocument.createTreeWalker(face, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node instanceof Text) {
      texts.push(node);
    }
  }
  for (const text of texts) {
    const piece = face.ownerDocument.createDocumentFragment();
    for (const sign of text.data) {
      piece.append(pieceFor(sign, face.ownerDocument, carved));
    }
    text.replaceWith(piece);
  }
  return carved;
}

/* The roll's timeline, paused, and the way back to the plain face. */
export function buildWheels(face: HTMLElement): {
  timeline: gsap.core.Timeline;
  revert: () => void;
} {
  const painted = face.cloneNode(true);
  const { wheels, glyphs } = carveFace(face);
  const timeline = gsap.timeline({ paused: true });
  wheels.forEach(({ column, steps }, place) => {
    timeline.fromTo(
      column,
      { yPercent: 0 },
      {
        yPercent: (-steps / (steps + 1)) * 100,
        duration: FIRST_ROLL + place * ROLL_MORE,
        ease: ROLL_EASE,
        force3D: false,
      },
      0,
    );
  });
  timeline.fromTo(
    glyphs,
    { yPercent: 30, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: GLYPH_FOR,
      ease: ease.emphasized,
      stagger: GLYPH_STAGGER,
      force3D: false,
    },
    GLYPHS_AT,
  );
  return {
    timeline,
    revert: () => {
      timeline.kill();
      face.replaceChildren(...painted.childNodes);
    },
  };
}
