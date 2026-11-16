import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { HOLD_SCREENS } from "../src/agents/hero-film-course.ts";
import { filmPart, HeroFilmPage, TITLE } from "./support/hero-film.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

function delaySeconds(element: HTMLElement): number {
  return Number(getComputedStyle(element).animationDelay.replace("s", ""));
}

function lastOf(elements: HTMLElement[], fallback: HTMLElement): HTMLElement {
  return elements.at(-1) ?? fallback;
}

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  releaseIdleCallbacks();
  vi.restoreAllMocks();
  await allowMotion();
  window.scrollTo(0, 0);
});

describe("HeroFilm", () => {
  it("paints the first frame behind the promise, the film not yet downloaded", async () => {
    const screen = await render(<HeroFilmPage />);

    await expect.element(screen.getByRole("heading", { level: 1, name: TITLE })).toBeVisible();
    await expect.element(screen.getByAltText("Le soleil se lève sur les montagnes")).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "Réserver une Immersion" }))
      .toBeVisible();
    await expect.element(screen.getByAltText("Le soleil levé")).not.toBeVisible();
    const video = screen.container.querySelector("video");
    expect(video?.getAttribute("preload")).toBe("none");
    expect(video?.querySelectorAll("source")).toHaveLength(0);
  });

  it("holds the stage over the film, then under the sheet that covers it", async () => {
    const screen = await render(<HeroFilmPage />);
    const track = filmPart(screen.container, "track");

    expect(track.getBoundingClientRect().height).toBeCloseTo(HOLD_SCREENS * DESKTOP.height, 0);
    window.scrollTo(0, HOLD_SCREENS * DESKTOP.height + DESKTOP.height / 2);
    await expect
      .poll(() => filmPart(screen.container, "stage").getBoundingClientRect().top)
      .toBe(0);
  });

  it("keeps the course in proportion on a phone, a screen of scroll being 62.5 % of its width", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(<HeroFilmPage />);

    expect(filmPart(screen.container, "track").getBoundingClientRect().height).toBeCloseTo(
      HOLD_SCREENS * 0.625 * PHONE.width,
      0,
    );
  });

  it("rests under reduced motion: the risen sun behind the promise, one screen high", async () => {
    await preferReducedMotion();
    const screen = await render(<HeroFilmPage />);

    await expect.element(screen.getByAltText("Le soleil levé")).toBeVisible();
    await expect
      .element(screen.getByAltText("Le soleil se lève sur les montagnes"))
      .not.toBeVisible();
    expect(filmPart(screen.container, "stage").getBoundingClientRect().height).toBe(DESKTOP.height);
    expect(filmPart(screen.container, "track").getBoundingClientRect().height).toBe(0);
  });

  it("downloads the film once the page is idle and the visitor engages", async () => {
    const screen = await render(<HeroFilmPage />);
    const video = screen.container.querySelector("video");

    await expect
      .poll(() => {
        releaseIdleCallbacks();
        window.dispatchEvent(new Event("scroll"));
        return video?.querySelectorAll("source").length;
      })
      .toBe(2);
  });

  it("raises the promise word by word from behind its edge after a still night, then the action", async () => {
    const screen = await render(<HeroFilmPage />);
    const rises = [
      ...screen.container.querySelectorAll<HTMLElement>(
        "[data-hero-film='word'] [data-hero-film='rise']",
      ),
    ];
    const action = filmPart(screen.container, "action-rise");

    expect(rises.map((rise) => rise.textContent).join(" ")).toBe(TITLE);
    expect(rises.map((rise) => getComputedStyle(rise).animationName)).toEqual(
      rises.map(() => "agents-rise"),
    );
    expect(rises.slice(0, 3).map((rise) => getComputedStyle(rise).animationDelay)).toEqual([
      "0.4s",
      "0.44s",
      "0.48s",
    ]);
    expect(getComputedStyle(action).animationName).toBe("agents-rise-action");
    expect(delaySeconds(action)).toBeGreaterThan(delaySeconds(lastOf(rises, action)));
    await expect.element(screen.getByRole("heading", { level: 1, name: TITLE })).toBeVisible();
  });

  it("paints the promise and its action still under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(<HeroFilmPage />);
    const moving = [
      ...screen.container.querySelectorAll<HTMLElement>(
        "[data-hero-film='rise'], [data-hero-film='action-rise']",
      ),
    ].filter((element) => getComputedStyle(element).animationName !== "none");

    expect(moving).toEqual([]);
  });
});
