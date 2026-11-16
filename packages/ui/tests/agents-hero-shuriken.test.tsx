import "../src/styles/globals.css";
import { gsap } from "gsap";
import { siGmail, siGooglesheets, siHubspot, siOdoo } from "simple-icons";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { shurikenChoreography } from "../src/agents/hero-shuriken-choreography.ts";
import { HeroShuriken } from "../src/agents/hero-shuriken.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

const props = {
  copy: <h1>Vos outils, un seul système.</h1>,
  poster: <img src={PIXEL} alt="Quatre feuilles posées à plat" />,
  folded: <img src={PIXEL} alt="Le signe SHUNPO plié" />,
  marks: [siGmail, siHubspot, siOdoo, siGooglesheets].map(({ title, path }) => ({ title, path })),
  caption: { before: "4 outils · chacun de son côté", after: "1 système · vos outils ensemble" },
} as const;

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  releaseIdleCallbacks();
  await allowMotion();
});

function shown(element: Element | null): boolean {
  return element !== null && getComputedStyle(element).visibility === "visible";
}

describe("HeroShuriken", () => {
  it("lays the sheets beside the promise on wide screens, the stage named by its poster", async () => {
    const screen = await render(<HeroShuriken {...props} />);

    await expect.element(screen.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.element(screen.getByAltText("Quatre feuilles posées à plat")).toBeVisible();
    await expect.element(screen.getByAltText("Le signe SHUNPO plié")).not.toBeVisible();
    await expect.element(screen.getByText(props.caption.before)).toBeVisible();
    const heading = screen.getByRole("heading", { level: 1 }).element().getBoundingClientRect();
    const stage = screen.getByAltText("Quatre feuilles posées à plat").element();
    expect(stage.getBoundingClientRect().left).toBeGreaterThan(heading.left);
  });

  it("shows the folded sign and its second line on phones", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(<HeroShuriken {...props} />);

    await expect.element(screen.getByAltText("Le signe SHUNPO plié")).toBeVisible();
    await expect.element(screen.getByAltText("Quatre feuilles posées à plat")).not.toBeVisible();
    expect(shown(screen.getByText(props.caption.after).element())).toBe(true);
    expect(shown(screen.getByText(props.caption.before).element())).toBe(false);
  });

  it("shows the folded sign under reduced motion, with no stage", async () => {
    await preferReducedMotion();
    const screen = await render(<HeroShuriken {...props} />);

    await expect.element(screen.getByAltText("Le signe SHUNPO plié")).toBeVisible();
    expect(screen.container.querySelector("[data-slot=stage] canvas")).toBeNull();
    expect(shown(screen.getByText(props.caption.after).element())).toBe(true);
  });

  it("runs the sign's progress with the scroll and cuts the caption as the points lock", async () => {
    const screen = await render(<HeroShuriken {...props} />);
    const progress = { value: 0 };
    const timeline = gsap.timeline({ paused: true });
    const scope = screen.container.querySelector<HTMLElement>("[data-slot=hero-shuriken]");
    shurikenChoreography(progress, scope)(timeline);
    const before = screen.getByText(props.caption.before).element();
    const after = screen.getByText(props.caption.after).element();

    timeline.progress(0.5);
    expect(progress.value).toBeCloseTo(0.5, 6);
    expect(Number(gsap.getProperty(after, "opacity"))).toBe(0);

    timeline.progress(1);
    expect(progress.value).toBe(1);
    expect(Number(gsap.getProperty(before, "opacity"))).toBe(0);
    expect(Number(gsap.getProperty(after, "opacity"))).toBe(1);
    timeline.kill();
  });
});
