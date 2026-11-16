import "../src/styles/globals.css";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { Shuriken } from "../src/brand/shuriken.tsx";

describe("Shuriken", () => {
  it("names the badge when it stands alone", async () => {
    const screen = await render(<Shuriken tone="paper" label="SHUNPO" />);

    await expect.element(screen.getByRole("img", { name: "SHUNPO" })).toBeVisible();
  });

  it("always draws its pebble, at 24 px at least, hidden from assistive technology beside a name", async () => {
    const screen = await render(<Shuriken size="sm" />);
    const svg = screen.container.querySelector("svg");
    const pebble = screen.container.querySelector("svg > path:first-child");

    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getBoundingClientRect().width).toBe(24);
    expect(pebble?.getBoundingClientRect().width).toBeGreaterThan(0);
  });
});
