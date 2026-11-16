import { gsap } from "gsap";

import type { CookieParts } from "./fortune-choreography.ts";
import type { CookieLayout } from "./fortune-geometry.ts";

const PART_NAMES = [
  "float",
  "whole",
  "cracked",
  "openLeft",
  "openRight",
  "label",
  "paper",
  "fold",
  "link",
] as const satisfies ReadonlyArray<Exclude<keyof CookieParts, "scene">>;

function part(root: HTMLElement, name: string): HTMLElement | undefined {
  const element = root.querySelector(`[data-cookie-part="${name}"]`);
  return element instanceof HTMLElement ? element : undefined;
}

function isComplete(found: Partial<CookieParts>): found is CookieParts {
  return PART_NAMES.every((name) => found[name] !== undefined);
}

/* Every part of a rendered cookie scene (`data-cookie-part`), or undefined while one is missing. */
export function cookieParts(root: HTMLElement): CookieParts | undefined {
  const found: Partial<CookieParts> = { scene: root };
  for (const name of PART_NAMES) {
    const element = part(root, name);
    if (element !== undefined) {
      found[name] = element;
    }
  }
  return isComplete(found) ? found : undefined;
}

function halves(split: number): [string, string] {
  return [
    `polygon(0 0,${split}% 0,${split}% 100%,0 100%)`,
    `polygon(${split}% 0,100% 0,100% 100%,${split}% 100%)`,
  ];
}

/* Places the button, the paper, its panels and the link for the measured layout. One open photograph keeps its
   own 1 380 × 793 box and `split` cuts it into its two halves. */
export function placeCookie(
  root: HTMLElement,
  { layout, split }: { layout: CookieLayout; split: number },
): void {
  const parts = cookieParts(root);
  if (parts === undefined) {
    return;
  }
  const { button, panelWidth, panelHeight, paperLeft, paperTop, linkTop } = layout;
  gsap.set(root, { height: layout.sceneHeight });
  gsap.set(parts.float, { left: layout.art.left, width: layout.art.width });
  gsap.set(part(root, "button") ?? [], { ...button });
  gsap.set(parts.paper, {
    left: paperLeft,
    top: paperTop,
    width: 2 * panelWidth,
    height: panelHeight,
  });
  gsap.set(root.querySelectorAll("[data-cookie-panel]"), { width: panelWidth });
  gsap.set(parts.fold, { left: panelWidth });
  gsap.set(part(root, "link-box") ?? [], { left: paperLeft, top: linkTop, width: 2 * panelWidth });
  const [left, right] = halves(split);
  gsap.set(parts.openLeft, { clipPath: left, transformOrigin: "24% 82%" });
  gsap.set(parts.openRight, { clipPath: right, transformOrigin: "76% 82%" });
}
