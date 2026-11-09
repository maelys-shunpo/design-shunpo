/* The geometry of the Shunpo Shift: the two-corner frame does not slide, it jumps to its target and leaves up to
   three ghosts along the way. Boxes are in the coordinates of the stage the frame is drawn in. */
export interface FrameBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameGhost extends FrameBox {
  opacity: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const GHOSTS = 3;
/* Opacity in hundredths, so the steps stay exact: 15, 30, 45. */
const FAINTEST = 15;

/* How far the frame stands off what it designates: the same on every side, or more on its sides than above
   and below (a line of text). */
type FramePad = number | { inline: number; block: number };

/* The frame around `rect` (a client rect), `pad` pixels outside it, in the coordinates of `origin`. */
export function frameAround(
  rect: Rect,
  origin: Pick<Rect, "left" | "top">,
  pad: FramePad,
): FrameBox {
  const { inline, block } = typeof pad === "number" ? { inline: pad, block: pad } : pad;
  return {
    x: rect.left - origin.left - inline,
    y: rect.top - origin.top - block,
    width: rect.width + 2 * inline,
    height: rect.height + 2 * block,
  };
}

function between(from: number, to: number, share: number): number {
  return from + (to - from) * share;
}

/* The ghosts a jump leaves: where the frame was, then a third and two thirds of the way, the oldest the
   faintest. None when the frame stays where it is. */
export function ghostTrail(from: FrameBox, to: FrameBox): FrameGhost[] {
  const moves = (["x", "y", "width", "height"] as const).some((key) => from[key] !== to[key]);
  if (!moves) {
    return [];
  }
  return Array.from({ length: GHOSTS }, (_, index) => {
    const share = index / GHOSTS;
    return {
      x: between(from.x, to.x, share),
      y: between(from.y, to.y, share),
      width: between(from.width, to.width, share),
      height: between(from.height, to.height, share),
      opacity: (FAINTEST * (index + 1)) / 100,
    };
  });
}
