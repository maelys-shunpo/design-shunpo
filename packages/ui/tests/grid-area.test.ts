import { describe, expect, it } from "vitest";

import { placementClasses } from "../src/layout/grid-area.tsx";

describe("placementClasses", () => {
  it("takes every content column where no placement is given", () => {
    expect(placementClasses({})).toBe("col-content md:col-content lg:col-content");
  });

  it("centres a plain span on the columns of its breakpoint", () => {
    expect(placementClasses({ md: 6, lg: 10 })).toBe(
      "col-content md:col-start-3 md:col-span-6 lg:col-start-3 lg:col-span-10",
    );
  });

  it("places an area from a start column", () => {
    expect(placementClasses({ lg: { start: 9, span: 4 } })).toContain(
      "lg:col-start-10 lg:col-span-4",
    );
  });

  it("never runs past the last column", () => {
    expect(placementClasses({ base: { start: 3, span: 4 } })).toContain("col-start-4 col-span-2");
  });

  it("bleeds from page edge to page edge", () => {
    expect(placementClasses({ md: "bleed", lg: "bleed" })).toBe(
      "col-content md:col-bleed lg:col-bleed",
    );
  });
});
