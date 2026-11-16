import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Testimonial } from "../src/agents/testimonial.tsx";
import { allowMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await allowMotion();
});

afterEach(async () => {
  await allowMotion();
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

  it("cuts its top right corner on the bias instead of rounding its corners", async () => {
    const screen = await render(card("Marc Biessy"));
    const figure = screen.getByRole("figure").element();
    expect(getComputedStyle(figure).borderTopRightRadius).toBe("0px");
    expect(getComputedStyle(figure, "::before").clipPath).toMatch(/^polygon/u);
  });
});
