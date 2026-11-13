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
    expect(classOf(bar)).toContain("before:opacity-0");
    window.scrollTo(0, 400);
    await expect.poll(() => classOf(bar)).toContain("agents-sheet-float");
  });

  it("lets a hero film show through: out of the flow, in Kome on the night until it floats", async () => {
    const screen = await render(
      <>
        <AgentsNav
          label="Navigation"
          brand={<span>marque</span>}
          links={null}
          action={null}
          over="film"
        />
        <div data-testid="film" style={{ height: "300vh" }} />
      </>,
    );
    const bar = screen.getByRole("navigation", { name: "Navigation" }).element();
    const header = screen.getByRole("banner").element();

    expect(getComputedStyle(header).position).toBe("fixed");
    expect(screen.getByTestId("film").element().getBoundingClientRect().top).toBe(0);
    expect(classOf(bar)).toContain("scheme-dark");
    window.scrollTo(0, 400);
    await expect.poll(() => classOf(bar)).toContain("agents-sheet-float");
    expect(classOf(bar)).not.toContain("scheme-dark");
  });
});
