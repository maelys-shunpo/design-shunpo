import { press } from "../motion/tokens.ts";

const SECONDS = 1000;
/* The highlight starts at the press, spreads to the control's longest side, and fades as it lets go. */
const START_OPACITY = 0.22;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* Plays the press highlight of a control from the point pressed. The highlight is the control's
   `[data-press-highlight]` child; nothing plays under reduced motion, where the control only changes state. */
export function playPressHighlight(control: HTMLElement, point: { x: number; y: number }): void {
  const highlight = control.querySelector<HTMLElement>("[data-press-highlight]");
  if (highlight === null || reducedMotion()) {
    return;
  }
  const box = control.getBoundingClientRect();
  const reach = Math.hypot(box.width, box.height) * 2;
  highlight.style.setProperty("left", `${String(point.x - box.left)}px`);
  highlight.style.setProperty("top", `${String(point.y - box.top)}px`);
  highlight.style.setProperty("width", `${String(reach)}px`);
  highlight.style.setProperty("height", `${String(reach)}px`);
  highlight.animate(
    [
      { transform: "translate(-50%, -50%) scale(0)", opacity: START_OPACITY },
      { transform: "translate(-50%, -50%) scale(1)", opacity: START_OPACITY / 2, offset: 0.6 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
    ],
    { duration: (press.in + press.out) * SECONDS, easing: press.easeIn },
  );
}

/* A press from the keyboard (Enter, Space) spreads from the control's centre. */
export function centreOf(control: HTMLElement): { x: number; y: number } {
  const box = control.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}
