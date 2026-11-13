import "../src/styles/globals.css";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Direction } from "../src/layout/direction.tsx";
import { Section } from "../src/layout/section.tsx";
import { PaperGate } from "../src/lib/paper-gate.tsx";

const FROISSE = /^url\(.*agents-froisse.*\.webp/u;

afterEach(() => {
  delete document.documentElement.dataset["papers"];
});

describe("PaperGate", () => {
  it("opens the papers once the page has loaded and gone idle", async () => {
    await render(<PaperGate />);

    await expect.poll(() => document.documentElement.dataset["papers"]).toBe("");
  });

  it("leaves a paper plain, the ground's own colour, until the papers open", async () => {
    const screen = await render(
      <Direction name="agents">
        <Section aria-label="Froissé" tone="muted" paper="froisse">
          Une section froissée
        </Section>
      </Direction>,
    );
    const section = screen.getByRole("region", { name: "Froissé" }).element();
    delete document.documentElement.dataset["papers"];

    expect(getComputedStyle(section).backgroundImage).toBe("none");

    document.documentElement.dataset["papers"] = "";

    expect(getComputedStyle(section).backgroundImage).toMatch(FROISSE);
  });
});
