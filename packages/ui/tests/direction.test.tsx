import "../src/styles/globals.css";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Direction } from "../src/layout/direction.tsx";
import { resolveColor } from "../src/lib/css-color.ts";

describe("Direction", () => {
  it("recolours the whole document from the direction a page names", async () => {
    const screen = await render(
      <Direction name="mecanique">
        <p>Page</p>
      </Direction>,
    );

    await expect.element(screen.getByText("Page")).toBeVisible();
    expect(resolveColor(document.documentElement, "--background")).toEqual([20, 26, 28]);
    expect(getComputedStyle(document.documentElement).colorScheme).toBe("dark");
  });

  it("reads a brand token as sRGB for the scenes", async () => {
    const screen = await render(
      <Direction name="fil">
        <p>Fil</p>
      </Direction>,
    );

    await expect.element(screen.getByText("Fil")).toBeVisible();
    expect(resolveColor(screen.container, "--brand-fushimi")).toEqual([185, 69, 50]);
  });
});
