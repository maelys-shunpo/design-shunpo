import "../src/styles/globals.css";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { AgentsNav } from "../src/agents/nav.tsx";

afterEach(() => {
  window.scrollTo(0, 0);
});

function classOf(element: Element): string {
  return element.getAttribute("class") ?? "";
}

describe("AgentsNav", () => {
  it("floats the bar once the visitor scrolls", async () => {
    const screen = await render(
      <>
        <AgentsNav label="Navigation" brand={<span>marque</span>} links={null} action={null} />
        <div style={{ height: "300vh" }} />
      </>,
    );
    const bar = screen.getByRole("navigation", { name: "Navigation" }).element();
    expect(classOf(bar)).toContain("bg-transparent");
    window.scrollTo(0, 400);
    await expect.poll(() => classOf(bar)).toContain("bg-surface");
  });
});
