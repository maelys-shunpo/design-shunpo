import "../src/styles/globals.css";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { PageGrid } from "../src/layout/page-grid.tsx";

function renderedGrid(container: HTMLElement): HTMLElement {
  const grid = container.querySelector<HTMLElement>("[data-slot=page-grid]");
  if (grid === null) {
    throw new Error("No page grid rendered");
  }
  return grid;
}

describe("PageGrid", () => {
  it("back-fills a row when asked to flow dense", async () => {
    const screen = await render(<PageGrid flow="dense" />);
    /* `grid-flow-row-dense` sets `grid-auto-flow: row dense`; CSSOM drops the default `row` on serialisation. */
    expect(getComputedStyle(renderedGrid(screen.container)).gridAutoFlow).toBe("dense");
  });
});
