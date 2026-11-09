import { type FrameBox, ghostTrail } from "../lib/frame-jump.ts";

/* Below this many pixels, a frame that keeps its target is not placed again. */
const STILL_PX = 0.5;

export type FrameTone = "paper" | "night";
/* `corners`: two 14 px corners; `bracket`: large brackets whose upright runs the full height of what they
   hold (a line of display type). */
export type FrameShape = "corners" | "bracket";

/* The ground the frame sits on, and its shape (`corners` by default). */
export interface FrameLook {
  tone: FrameTone;
  shape?: FrameShape;
}

export interface TravellingFrame {
  /* Designate `box` (in the layer's coordinates), the target named `key`, on a `tone` ground. A new key
     jumps there (Shunpo Shift) and leaves ghosts; the same key follows its target at once, never sliding. */
  show: (key: string, box: FrameBox, look: FrameLook) => void;
  hide: () => void;
  dispose: () => void;
}

interface Placed {
  key: string;
  box: FrameBox;
}

function setBox(element: HTMLElement, box: FrameBox): void {
  element.style.setProperty("translate", `${String(box.x)}px ${String(box.y)}px`);
  element.style.setProperty("width", `${String(box.width)}px`);
  element.style.setProperty("height", `${String(box.height)}px`);
}

function moved(from: FrameBox, to: FrameBox): boolean {
  return (["x", "y", "width", "height"] as const).some(
    (side) => Math.abs(from[side] - to[side]) > STILL_PX,
  );
}

/* Places `frame` without its jump: set where it goes, read back, then let it transition again. */
function placeAtOnce(frame: HTMLElement, box: FrameBox): void {
  frame.toggleAttribute("data-instant", true);
  setBox(frame, box);
  frame.getBoundingClientRect();
  frame.toggleAttribute("data-instant", false);
}

/* One two-corner frame that travels from target to target in `layer` (DA « Shunpo Shift »): it jumps in
   240 ms on the shift curve (`agents-frame-travel`) and leaves three ghosts along the way, fading in 200 ms
   (`agents-frame-ghost`, marked `ghostAttribute`). Kome on the night, Fushimi on paper. */
export function travellingFrame(
  layer: HTMLElement,
  frame: HTMLElement,
  ghostAttribute: string,
): TravellingFrame {
  let placed: Placed | undefined;
  /* The frame this factory owns, written through (its tone) as the scene designates. */
  const owned = frame;

  function leaveGhosts(from: FrameBox, to: FrameBox, { tone, shape = "corners" }: FrameLook): void {
    for (const ghost of ghostTrail(from, to)) {
      const element = document.createElement("span");
      element.setAttribute(ghostAttribute, "");
      element.setAttribute("aria-hidden", "true");
      element.dataset["tone"] = tone;
      element.dataset["shape"] = shape;
      element.className = "agents-frame-ghost";
      element.style.setProperty("--ghost", String(ghost.opacity));
      setBox(element, ghost);
      element.addEventListener("animationend", () => {
        element.remove();
      });
      layer.append(element);
    }
  }

  function show(key: string, box: FrameBox, look: FrameLook): void {
    const { tone, shape = "corners" } = look;
    owned.dataset["tone"] = tone;
    owned.dataset["shape"] = shape;
    if (placed === undefined) {
      placeAtOnce(frame, box);
      frame.toggleAttribute("data-shown", true);
    } else if (placed.key === key) {
      if (moved(placed.box, box)) {
        placeAtOnce(frame, box);
      }
    } else {
      leaveGhosts(placed.box, box, look);
      setBox(frame, box);
    }
    placed = { key, box };
  }

  function hide(): void {
    frame.toggleAttribute("data-shown", false);
    placed = undefined;
  }

  function dispose(): void {
    hide();
    frame.removeAttribute("style");
    for (const ghost of layer.querySelectorAll(`[${ghostAttribute}]`)) {
      ghost.remove();
    }
  }

  return { show, hide, dispose };
}
