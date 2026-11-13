import "../src/styles/globals.css";
import { gsap } from "gsap";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { FILM_SCREENS, HOLD_SCREENS, heroFilmCourse } from "../src/agents/hero-film-course.ts";
import { splitPromiseLetters } from "../src/agents/hero-film-letters.ts";
import { CUES, filmPart, HeroFilmPage, shown, TITLE } from "./support/hero-film.tsx";

async function course() {
  const screen = await render(<HeroFilmPage />);
  const seek = vi.fn<(share: number) => void>();
  const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const stage = filmPart(screen.container, "stage");
  /* The scene splits the promise into letters once the faces are loaded, before building the course; mirror that here. */
  await document.fonts.ready;
  splitPromiseLetters(stage);
  heroFilmCourse(stage, CUES, seek)(timeline);
  return { screen, container: screen.container, seek, timeline };
}

function letters(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-hero-film='letter']")];
}

function level(letter: HTMLElement, name: "--lit" | "--heat"): number {
  return Number(letter.style.getPropertyValue(name) || "0");
}

/* The letters of the promise's first and last lines, the last one nearest the sun below the promise. */
function topAndBottom(container: HTMLElement): { top: HTMLElement; bottom: HTMLElement } {
  const all = letters(container);
  const byTop = all.toSorted(
    (one, other) => one.getBoundingClientRect().top - other.getBoundingClientRect().top,
  );
  const [top] = byTop;
  const bottom = byTop.at(-1);
  if (top === undefined || bottom === undefined) {
    throw new Error("The promise has no letters");
  }
  return { top, bottom };
}

describe("heroFilmCourse", () => {
  it("lasts the hold, the film playing over its first screens", async () => {
    const { seek, timeline } = await course();

    expect(timeline.duration()).toBeCloseTo(HOLD_SCREENS);
    timeline.seek(FILM_SCREENS / 2, false);
    expect(seek).toHaveBeenLastCalledWith(expect.closeTo(0.5, 2));
    timeline.seek(FILM_SCREENS + 0.1, false);
    expect(seek).toHaveBeenLastCalledWith(1);
  });

  it("splits the promise into letters it still reads as one sentence", async () => {
    const { screen, container } = await course();

    expect(
      letters(container)
        .map((letter) => letter.textContent)
        .join(""),
    ).toBe(TITLE.replaceAll(" ", ""));
    await expect.element(screen.getByRole("heading", { level: 1, name: TITLE })).toBeVisible();
  });

  it("lets the sunlight climb through the letters from the horizon before the leave mark", async () => {
    const { container, timeline } = await course();
    const { top, bottom } = topAndBottom(container);

    timeline.seek(0, false);
    expect(letters(container).every((letter) => level(letter, "--lit") === 0)).toBe(true);
    timeline.seek(FILM_SCREENS * CUES.leaveAt * 0.45, false);
    expect(level(bottom, "--lit")).toBeGreaterThan(level(top, "--lit"));
    timeline.seek(FILM_SCREENS * (CUES.leaveAt - 0.01), false);
    expect(letters(container).every((letter) => level(letter, "--lit") === 1)).toBe(true);
    expect(letters(container).every((letter) => shown(letter))).toBe(true);
  });

  it("overexposes the promise from the sun outwards, then gives it back to the sky with the action", async () => {
    const { container, timeline } = await course();
    const { top, bottom } = topAndBottom(container);

    timeline.seek(FILM_SCREENS * (CUES.leaveAt + 0.05), false);
    expect(level(bottom, "--heat")).toBeGreaterThan(level(top, "--heat"));
    timeline.seek(FILM_SCREENS * (CUES.leaveAt + 0.2) + 0.01, false);
    expect(letters(container).some((letter) => shown(letter))).toBe(false);
    expect(shown(filmPart(container, "action"))).toBe(false);
    timeline.seek(0, false);
    expect(letters(container).every((letter) => shown(letter))).toBe(true);
    expect(shown(filmPart(container, "action"))).toBe(true);
  });

  it("holds the film's last frame, unmoved, until the sheet rises over it", async () => {
    const { container, seek, timeline } = await course();
    const film = filmPart(container, "film");

    timeline.seek(HOLD_SCREENS, false);
    expect(seek).toHaveBeenLastCalledWith(1);
    expect(gsap.getProperty(film, "scale")).toBe(1);
    expect(shown(film)).toBe(true);
  });
});
