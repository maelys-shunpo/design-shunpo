import "../src/styles/globals.css";
import { type ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { TestimonialDrift } from "../src/agents/testimonial-drift.tsx";
import { Testimonial } from "../src/agents/testimonial.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await allowMotion();
});

function card(author: string): ReactElement {
  return (
    <Testimonial
      key={author}
      quote={`${author} nous a confié un projet.`}
      author={author}
      position="CEO, Exemple"
      initials={author}
      tone="ink"
    />
  );
}

/* Authors of the testimonials actually laid out (not in a display:none layout) and not inside the repeated copy. */
function visibleAuthors(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>("[data-slot=testimonial]")]
    .filter(
      (element) =>
        element.offsetParent !== null && element.closest('[aria-hidden="true"]') === null,
    )
    .map((element) => element.querySelector(".font-medium")?.textContent ?? "");
}

function displayedMarquees(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>("[data-slot=marquee]")].filter(
    (marquee) => marquee.offsetParent !== null,
  );
}

/* The inline transform GSAP wrote on a marquee's track, empty when none. */
function trackTransform(marquee: HTMLElement): string {
  return marquee.querySelector<HTMLElement>(":scope > div")?.style.transform ?? "";
}

function asThree(elements: HTMLElement[]): [HTMLElement, HTMLElement, HTMLElement] {
  const [first, second, third] = elements;
  if (first === undefined || second === undefined || third === undefined) {
    throw new Error("Expected three drifting columns");
  }
  return [first, second, third];
}

function asOne(elements: HTMLElement[]): HTMLElement {
  const [only] = elements;
  if (only === undefined) {
    throw new Error("Expected one drifting row");
  }
  return only;
}

/* Idle is mocked in beforeEach; a single release can miss an AfterIdle effect that registers its idle callback a tick
   late under load, leaving the motion mounted never, so the drift would stay still forever. Flush idle on every poll
   until the first column actually drifts, which catches any late registration and proves the tween is ticking. */
async function startedColumns(
  container: HTMLElement,
  releaseIdle: () => void,
): Promise<[HTMLElement, HTMLElement, HTMLElement]> {
  const [first, second, third] = asThree(displayedMarquees(container));
  await expect
    .poll(
      () => {
        releaseIdle();
        return trackTransform(first);
      },
      { timeout: 12000 },
    )
    .toContain("translate");
  await expect.poll(() => trackTransform(second), { timeout: 12000 }).toContain("translate");
  await expect.poll(() => trackTransform(third), { timeout: 12000 }).toContain("translate");
  return [first, second, third];
}

describe("TestimonialDrift", () => {
  it("splits the cards over three columns from lg, every third card in each", async () => {
    const screen = await render(
      <TestimonialDrift label="Avis de clients">
        {["A", "B", "C", "D", "E", "F"].map((author) => card(author))}
      </TestimonialDrift>,
    );
    const columns = displayedMarquees(screen.container);
    expect(columns).toHaveLength(3);
    const [first, second, third] = asThree(columns);
    expect(visibleAuthors(first)).toEqual(["A", "D"]);
    expect(visibleAuthors(second)).toEqual(["B", "E"]);
    expect(visibleAuthors(third)).toEqual(["C", "F"]);
  });

  it("keeps every card when the count does not divide by three", async () => {
    const screen = await render(
      <TestimonialDrift label="Avis de clients">
        {["A", "B", "C", "D", "E"].map((author) => card(author))}
      </TestimonialDrift>,
    );
    const columns = displayedMarquees(screen.container);
    expect(columns).toHaveLength(3);
    const [first, second, third] = asThree(columns);
    expect(visibleAuthors(first)).toEqual(["A", "D"]);
    expect(visibleAuthors(second)).toEqual(["B", "E"]);
    expect(visibleAuthors(third)).toEqual(["C"]);
  });

  it("reads each card once", async () => {
    const screen = await render(
      <TestimonialDrift label="Avis de clients">
        {["A", "B", "C", "D", "E", "F"].map((author) => card(author))}
      </TestimonialDrift>,
    );
    expect(visibleAuthors(screen.container)).toHaveLength(6);
  });

  it("runs one row on a phone", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(
      <TestimonialDrift label="Avis de clients">
        {["A", "B", "C", "D", "E", "F"].map((author) => card(author))}
      </TestimonialDrift>,
    );
    const rows = displayedMarquees(screen.container);
    expect(rows).toHaveLength(1);
    expect(visibleAuthors(asOne(rows))).toHaveLength(6);
  });

  it("holds every column while the pointer is over one", async () => {
    const screen = await render(
      <TestimonialDrift label="Avis de clients" laps={[2, 3, 2]}>
        {["A", "B", "C", "D", "E", "F"].map((author) => card(author))}
      </TestimonialDrift>,
    );
    const [first, second, third] = await startedColumns(screen.container, releaseIdleCallbacks);
    first.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    const heldFirst = trackTransform(first);
    const heldSecond = trackTransform(second);
    const heldThird = trackTransform(third);
    await pause(SETTLE_MS);
    expect(trackTransform(first)).toBe(heldFirst);
    expect(trackTransform(second)).toBe(heldSecond);
    expect(trackTransform(third)).toBe(heldThird);
    first.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    await expect.poll(() => trackTransform(first), { timeout: 12000 }).not.toBe(heldFirst);
    await expect.poll(() => trackTransform(second), { timeout: 12000 }).not.toBe(heldSecond);
    await expect.poll(() => trackTransform(third), { timeout: 12000 }).not.toBe(heldThird);
  });

  it("holds the drift while it has keyboard focus", async () => {
    const screen = await render(
      <TestimonialDrift label="Avis de clients" laps={[2, 3, 2]}>
        {["A", "B", "C", "D", "E", "F"].map((author) => card(author))}
      </TestimonialDrift>,
    );
    const group = screen.container.querySelector<HTMLElement>("[data-slot=testimonial-drift]");
    const [first, second, third] = await startedColumns(screen.container, releaseIdleCallbacks);
    /* The group is the first tab stop: nothing inside a testimonial takes focus, so one tab lands on it. */
    await userEvent.tab();
    expect(document.activeElement).toBe(group);
    const heldFirst = trackTransform(first);
    const heldSecond = trackTransform(second);
    const heldThird = trackTransform(third);
    await pause(SETTLE_MS);
    expect(trackTransform(first)).toBe(heldFirst);
    expect(trackTransform(second)).toBe(heldSecond);
    expect(trackTransform(third)).toBe(heldThird);
    group?.blur();
    await expect.poll(() => trackTransform(first), { timeout: 12000 }).not.toBe(heldFirst);
    await expect.poll(() => trackTransform(second), { timeout: 12000 }).not.toBe(heldSecond);
    await expect.poll(() => trackTransform(third), { timeout: 12000 }).not.toBe(heldThird);
  });

  it("shows every card whole under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(
      <TestimonialDrift label="Avis de clients">
        {["A", "B", "C", "D", "E", "F"].map((author) => card(author))}
      </TestimonialDrift>,
    );
    expect(visibleAuthors(screen.container).toSorted()).toEqual(["A", "B", "C", "D", "E", "F"]);
  });
});
