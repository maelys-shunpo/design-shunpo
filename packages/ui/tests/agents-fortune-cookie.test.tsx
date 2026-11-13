import "../src/styles/globals.css";
import { gsap } from "gsap";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { FortuneCookie } from "../src/agents/fortune-cookie.tsx";
import { cookieLayout } from "../src/agents/fortune-geometry.ts";
import { sampleCookie } from "../stories/support/cookie-sample.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";

const FORTUNE = "de votre facture remboursés en crédit d’impôt.";
/* The scene never grows wider than a prose column (40 rem). */
const LAYOUT = cookieLayout(640, false, sampleCookie);
const PAPER_TOP = `${LAYOUT.paperTop}px`;

afterEach(async () => {
  vi.restoreAllMocks();
  await allowMotion();
  await page.viewport(1280, 800);
  window.scrollTo(0, 0);
});

function Cookie({ trigger = "click" }: { trigger?: "click" | "arrival" }) {
  return (
    <div style={{ width: 690 }}>
      <FortuneCookie
        art={sampleCookie}
        trigger={trigger}
        label="Casser le biscuit"
        cursor="Casser"
        prefix="Jusqu’à"
        figure="20"
        unit="%"
        fortune={FORTUNE}
        link={<a href="#questions">Voir les conditions</a>}
      />
    </div>
  );
}

function paper(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-cookie-part=paper]");
}

describe("FortuneCookie", () => {
  it("paints the whole cookie and its button before the page is idle, its motion loaded only then", async () => {
    const runIdle = holdIdleCallbacks();
    const screen = await render(<Cookie />);

    await expect
      .element(screen.getByRole("button", { name: "Casser le biscuit" }))
      .toBeInTheDocument();
    expect(paper(screen.container)?.style.top).toBe("");

    runIdle();

    await expect.poll(() => paper(screen.container)?.style.top).toBe(PAPER_TOP);
  });

  it("lays the scene out for its width, capped at a prose column", async () => {
    const screen = await render(<Cookie />);

    await expect.poll(() => paper(screen.container)?.style.top).toBe(PAPER_TOP);
    expect(
      screen.container.querySelector<HTMLElement>("[data-slot=fortune-cookie]")?.style.height,
    ).toBe(`${LAYOUT.sceneHeight}px`);
  });

  it("opens when clicked from the keyboard and hands the paper the focus", async () => {
    const screen = await render(<Cookie />);
    const button = screen.getByRole("button", { name: "Casser le biscuit" });
    await expect.poll(() => paper(screen.container)?.style.top).toBe(PAPER_TOP);

    button.element().focus();
    await userEvent.keyboard("{Enter}");

    await expect
      .poll(() => document.activeElement === paper(screen.container), { timeout: 4000 })
      .toBe(true);
    expect(paper(screen.container)?.getAttribute("aria-hidden")).toBe("false");
    await expect.element(screen.getByRole("link", { name: "Voir les conditions" })).toBeVisible();
  });

  it("rests lower while closed so the cookie, not its hidden paper, is centred, then rises as it opens", async () => {
    const screen = await render(<Cookie />);
    function scene(): HTMLElement | null {
      return screen.container.querySelector<HTMLElement>("[data-slot=fortune-cookie]");
    }
    await expect.poll(() => scene()?.style.top).toBe(`${LAYOUT.restOffset}px`);

    await userEvent.click(screen.getByRole("button", { name: "Casser le biscuit" }));

    await expect.poll(() => scene()?.style.top, { timeout: 4000 }).toBe("0px");
  });

  it("reads the figure with its qualifier, the paper lying straight once read", async () => {
    const screen = await render(<Cookie />);
    await expect.poll(() => paper(screen.container)?.style.top).toBe(PAPER_TOP);

    await userEvent.click(screen.getByRole("button", { name: "Casser le biscuit" }));

    await expect
      .poll(() => paper(screen.container)?.getAttribute("aria-hidden"), { timeout: 4000 })
      .toBe("false");
    await expect.element(screen.getByText("Jusqu’à")).toBeVisible();
    await expect
      .poll(() => gsap.getProperty(paper(screen.container), "rotation"), { timeout: 3000 })
      .toBe(0);
  });

  it("gives under the pointer and stays whole when the pointer leaves", async () => {
    const screen = await render(<Cookie />);
    const button = screen.getByRole("button", { name: "Casser le biscuit" });
    await expect.poll(() => paper(screen.container)?.style.top).toBe(PAPER_TOP);
    const element = button.element();

    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
    element.dispatchEvent(new PointerEvent("pointerout", { bubbles: true }));
    element.dispatchEvent(new PointerEvent("pointerleave", { bubbles: false }));

    await expect.element(button).toHaveAttribute("aria-expanded", "false");
  });

  it("opens by itself once it is well into the screen", async () => {
    const screen = await render(<Cookie trigger="arrival" />);

    await expect
      .poll(() => paper(screen.container)?.getAttribute("aria-hidden"), { timeout: 5000 })
      .toBe("false");
  });

  it("is open at once when the user prefers reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(<Cookie />);

    await expect.poll(() => paper(screen.container)?.getAttribute("aria-hidden")).toBe("false");
    expect(
      screen.container.querySelector("[data-cookie-part=button]")?.hasAttribute("hidden"),
    ).toBe(true);
    await expect.element(screen.getByText(FORTUNE)).toBeVisible();
  });
});
