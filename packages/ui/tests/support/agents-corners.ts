import { expect } from "vitest";
import { page } from "vitest/browser";

import { DESKTOP, PHONE } from "./viewports.ts";

/* What the cut and the corners of the Agents direction compute to, read in the browser. */

/* A radius this large only draws a circle or a pill (`rounded-full`). */
const CIRCLE_RADIUS = 9999;

/* The depth of an element's cut (`--agents-cut`, a registered length), empty when the element is missing. */
export function cutOf(element: Element | null): string {
  if (element === null) {
    return "";
  }
  return getComputedStyle(element).getPropertyValue("--agents-cut").trim();
}

function isCircle(element: Element, radius: number): boolean {
  if (radius >= CIRCLE_RADIUS) {
    return true;
  }
  const { width, height } = element.getBoundingClientRect();
  return radius >= Math.min(width, height) / 2;
}

/* Every element of the container rounding a corner that is not a circle: what the cut forbids. */
export function roundedElements(container: HTMLElement): Element[] {
  return [container, ...container.querySelectorAll("*")].filter((element) => {
    const style = getComputedStyle(element);
    const radii = [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ].map((radius) => Number(radius.replace(/px$/u, "")) || 0);
    const largest = Math.max(...radii);
    return largest > 0 && !isCircle(element, largest);
  });
}

/* How an element casts its shadow: a filter follows the cut, a box shadow would be clipped flat. */
export function shadowOf(element: Element): { filter: string; boxShadow: string } {
  const style = getComputedStyle(element);
  return { filter: style.filter, boxShadow: style.boxShadow };
}

/* The element a selector picks under the root, or a failure naming the selector. */
export function part(root: Element, selector: string): Element {
  const found = root.querySelector(selector);
  if (found === null) {
    throw new Error(`Nothing matches ${selector}`);
  }
  return found;
}

/* The element a selector picks at an index under the root, or a failure naming both. */
export function nth(root: Element, selector: string, index: number): Element {
  const found = [...root.querySelectorAll(selector)].at(index);
  if (found === undefined) {
    throw new Error(`Nothing matches ${selector} at ${String(index)}`);
  }
  return found;
}

/* The element's parent, or a failure: a row is always inside a list. */
export function parentOf(element: Element): Element {
  const parent = element.parentElement;
  if (parent === null) {
    throw new Error("The element has no parent");
  }
  return parent;
}

/* How many points a clip path's polygon has: 5 for a cut sheet, 12 for the ring of its hairline. */
export function pointsOf(clipPath: string): number {
  return clipPath.split(",").length;
}

/* Every element under the root drawing a box: a 1 px border on all four sides. */
export function boxesUnder(root: Element): Element[] {
  return [...root.querySelectorAll("*")].filter((element) => {
    const style = getComputedStyle(element);
    return [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ].every((width) => width === "1px");
  });
}

/* Flags the halo tool around an element as connected, the way its course does. */
export async function atDesktop(): Promise<void> {
  await page.viewport(DESKTOP.width, DESKTOP.height);
}

export async function atPhone(): Promise<void> {
  await page.viewport(PHONE.width, PHONE.height);
}

/* Whether a sheet folds its cut corner in (`agents-sheet-fold`): the fold is a gradient on its `::after`. */
export function folded(element: Element): boolean {
  return getComputedStyle(element, "::after").backgroundImage.includes("linear-gradient");
}

/* An approval the tests never give: the cards are only looked at. */
export function neverApprove(id: string): void {
  expect(id).toBeTypeOf("string");
}
