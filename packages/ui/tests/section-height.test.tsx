import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Section } from "../src/layout/section.tsx";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

describe("Section height", () => {
  it("fills the window when it is a screen", async () => {
    const screen = await render(
      <Section height="screen" aria-label="Plein écran">
        <p>Une ligne</p>
      </Section>,
    );
    const section = screen.getByRole("region", { name: "Plein écran" }).element();

    expect(section.getBoundingClientRect().height).toBeGreaterThanOrEqual(window.innerHeight);
  });
});
