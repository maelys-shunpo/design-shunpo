import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { TestimonialCascade } from "../src/agents/testimonial-cascade.tsx";
import { Testimonial } from "../src/agents/testimonial.tsx";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await allowMotion();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

const labels = { pages: ["Avis 1", "Avis 3"], pause: "Pause", play: "Lecture" };

function card(author: string, source?: string) {
  return (
    <Testimonial
      quote="Très pro."
      author={author}
      position="CEO, Exemple"
      initials="EX"
      source={source}
    />
  );
}

/* The cascade sits under a screen of something else, out of the window when the page hydrates. */
function belowTheFold() {
  return (
    <>
      <div className="h-svh" />
      <div className="h-svh" />
      <TestimonialCascade label="Avis" labels={labels} every={60_000}>
        {[card("A"), card("B"), card("C")]}
      </TestimonialCascade>
    </>
  );
}

describe("Testimonial", () => {
  it("signs the quote with a name and a role, and shows its source when given", async () => {
    const screen = await render(card("Marc Biessy", "Avis publié sur shunpo.fr"));
    await expect.element(screen.getByText("Marc Biessy")).toBeVisible();
    await expect.element(screen.getByText("CEO, Exemple")).toBeVisible();
    await expect.element(screen.getByText("Avis publié sur shunpo.fr")).toBeVisible();
  });

  it("cuts its top right corner on the bias instead of rounding its corners", async () => {
    const screen = await render(card("Marc Biessy"));
    const figure = screen.getByRole("figure").element();
    expect(getComputedStyle(figure).borderTopRightRadius).toBe("0px");
    expect(getComputedStyle(figure, "::before").clipPath).toMatch(/^polygon/u);
  });

  it("steps the second card of a pair to the far edge from tablets up", async () => {
    const screen = await render(
      <TestimonialCascade label="Avis" labels={labels}>
        {[card("A"), card("B")]}
      </TestimonialCascade>,
    );
    const [first, second] = [...screen.container.querySelectorAll("li")].map(
      (item) => item.getBoundingClientRect().left,
    );
    expect(second).toBeGreaterThan(Number(first));
  });
});

describe("TestimonialCascade", () => {
  it("shows the cards two by two, a pair picked from its control, the rest out of reach", async () => {
    const screen = await render(
      <TestimonialCascade label="Avis" labels={labels} every={60_000}>
        {[card("A"), card("B"), card("C")]}
      </TestimonialCascade>,
    );
    await expect.element(screen.getByText("A", { exact: true })).toBeVisible();
    await expect.element(screen.getByText("C", { exact: true })).not.toBeVisible();
    await screen.getByRole("button", { name: "Avis 3" }).click();
    await expect.element(screen.getByText("C", { exact: true })).toBeVisible();
    await expect
      .element(screen.getByRole("button", { name: "Avis 3" }))
      .toHaveAttribute("aria-current", "true");
  });

  it("moves on by itself, and stops when paused", async () => {
    const screen = await render(
      <TestimonialCascade label="Avis" labels={labels} every={300}>
        {[card("A"), card("B"), card("C")]}
      </TestimonialCascade>,
    );
    await userEvent.unhover(screen.getByRole("region", { name: "Avis" }));
    await expect.element(screen.getByText("C", { exact: true })).toBeVisible();
    await screen.getByRole("button", { name: "Pause" }).click();
    const shown = screen.getByRole("button", { name: "Lecture" });
    await expect.element(shown).toBeVisible();
  });

  it("holds a pair the visitor has not seen yet in the air, and lands it as it comes into view", async () => {
    const screen = await render(belowTheFold());
    await expect.element(screen.getByText("A", { exact: true })).not.toBeVisible();
    screen.getByRole("region", { name: "Avis" }).element().scrollIntoView({ block: "center" });
    await expect.element(screen.getByText("A", { exact: true })).toBeVisible();
    await expect.element(screen.getByText("B", { exact: true })).toBeVisible();
  });

  it("leaves a pair out of view as painted under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(belowTheFold());
    await pause(SETTLE_MS);
    await expect.element(screen.getByText("A", { exact: true })).toBeVisible();
  });
});
