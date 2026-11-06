import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Shuriken } from "../src/brand/shuriken.tsx";

describe("Shuriken", () => {
  it("names the badge when it stands alone", async () => {
    const screen = await render(<Shuriken tone="paper" label="SHUNPO" />);

    await expect.element(screen.getByRole("img", { name: "SHUNPO" })).toBeVisible();
  });

  it("hides the glyph from assistive technology when it only marks a label", async () => {
    const screen = await render(<Shuriken tone="glyph" size="xs" />);
    const svg = screen.container.querySelector("svg");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.querySelector("path")?.getAttribute("class")).toContain("hidden");
  });
});
