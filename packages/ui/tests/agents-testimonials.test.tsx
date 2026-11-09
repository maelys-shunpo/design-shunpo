import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { TestimonialCascade } from "../src/agents/testimonial-cascade.tsx";
import { Testimonial } from "../src/agents/testimonial.tsx";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

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

  it("steps every other card to the far edge from tablets up", async () => {
    const screen = await render(
      <TestimonialCascade label="Avis">{[card("A"), card("B")]}</TestimonialCascade>,
    );
    const [first, second] = [...screen.container.querySelectorAll("li")].map(
      (item) => item.getBoundingClientRect().left,
    );
    expect(second).toBeGreaterThan(Number(first));
  });
});
