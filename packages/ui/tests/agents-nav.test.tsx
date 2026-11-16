import "../src/styles/globals.css";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { NavAnchor } from "../src/agents/nav-anchor.tsx";
import { AgentsNav } from "../src/agents/nav.tsx";

afterEach(() => {
  window.scrollTo(0, 0);
});

function classOf(element: Element): string {
  return element.getAttribute("class") ?? "";
}

/* Two links of the bar over two tall sections, so scrolling moves the band from one to the other. */
function spyScene() {
  return (
    <>
      <AgentsNav
        label="Navigation"
        brand={<span>marque</span>}
        action={null}
        links={
          <>
            <NavAnchor href="#one">Un</NavAnchor>
            <NavAnchor href="#two">Deux</NavAnchor>
          </>
        }
      />
      <section id="one" style={{ height: "150vh" }}>
        Section un
      </section>
      <section id="two" style={{ height: "150vh" }}>
        Section deux
      </section>
    </>
  );
}

function currentHref(container: HTMLElement): string | null {
  const current = container.querySelector("[data-slot=nav-anchor][aria-current]");
  return current === null ? null : current.getAttribute("href");
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

  it("marks the nav item of the section the reader is in as current", async () => {
    const screen = await render(spyScene());
    const container = screen.container;

    window.scrollTo(0, Math.round(window.innerHeight * 2));
    await expect.poll(() => currentHref(container)).toBe("#two");

    window.scrollTo(0, Math.round(window.innerHeight * 0.5));
    await expect.poll(() => currentHref(container)).toBe("#one");
  });

  it("goes clean of the page cursor over a nav item", async () => {
    const screen = await render(
      <AgentsNav
        label="Navigation"
        brand={<span>marque</span>}
        action={null}
        links={<NavAnchor href="#one">Un</NavAnchor>}
      />,
    );
    const anchor = screen.container.querySelector<HTMLElement>("[data-slot=nav-anchor]");
    expect(anchor?.dataset["cursor"]).toBe("away");
  });
});
