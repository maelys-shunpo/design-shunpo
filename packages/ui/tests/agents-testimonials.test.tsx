import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { TestimonialCascade } from "../src/agents/testimonial-cascade.tsx";
import { Testimonial } from "../src/agents/testimonial.tsx";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
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

describe("Testimonial", () => {
  it("signs the quote with a name and a role, and shows its source when given", async () => {
    const screen = await render(card("Marc Biessy", "Avis publié sur shunpo.fr"));
    await expect.element(screen.getByText("Marc Biessy")).toBeVisible();
    await expect.element(screen.getByText("CEO, Exemple")).toBeVisible();
    await expect.element(screen.getByText("Avis publié sur shunpo.fr")).toBeVisible();
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
});
