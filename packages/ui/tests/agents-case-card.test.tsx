import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";

import { CaseCard } from "../src/agents/case-card.tsx";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const MISSION =
  "L’application de jeu d’une émission en prime time, conçue pour tenir un trafic massif.";

function tf1(tint: "kurenai" | "tenku" | "shiro" = "kurenai") {
  return (
    <CaseCard
      href="#tf1"
      client="TF1"
      logo={<img src={PIXEL} alt="" />}
      tint={tint}
      figure="1,4"
      unit="M"
      figureLabel="de téléspectateurs ont joué avec l’application"
      mission={MISSION}
      image={<img src={PIXEL} alt="" />}
      action="Lire le cas client"
    />
  );
}

/* An element's computed opacity, "" when there is none. */
function opacityOf(element: Element | null): string {
  return element === null ? "" : getComputedStyle(element).opacity;
}

function stat(container: HTMLElement): Element | null {
  return container.querySelector("[data-case-stat]");
}

function mission(container: HTMLElement): Element | null {
  return container.querySelector("[data-case-mission]");
}

/* The pixel length the folded corner takes, read from the card. */
function foldOf(link: Element): number {
  return Number(getComputedStyle(link).getPropertyValue("--agents-fold").replace("px", ""));
}

/* How visible the frame's top start corner is on the card. */
function cornerOpacityOf(link: Element): string {
  return getComputedStyle(link, "::before").opacity;
}

/* The key figure's size in pixels (its digits, not its unit). */
function figureSizeOf(container: HTMLElement): number {
  const digits = container.querySelector("[data-slot=rolling-figure] [aria-hidden=true] > span");
  return digits === null ? Number.NaN : Number(getComputedStyle(digits).fontSize.replace("px", ""));
}

/* The first word of the mission, the one that rises first. */
function firstWord(container: HTMLElement): Element | null {
  return container.querySelector("[data-case-word]");
}

describe("CaseCard", () => {
  it("names the client, its key figure, what it measures, its mission and the way in", async () => {
    const screen = await render(tf1());
    const link = screen.getByRole("link");

    await expect.element(link).toHaveAccessibleName(/TF1/u);
    await expect.element(link).toHaveAccessibleName(/1,4\sM de téléspectateurs/u);
    await expect.element(link).toHaveAccessibleName(/trafic massif/u);
    await expect.element(link).toHaveAccessibleName(/Lire le cas client/u);
  });

  it("signs the card with the client's name set like a wordmark when it has no logo", async () => {
    const screen = await render(
      <CaseCard
        href="#vicat"
        client="Groupe Vicat"
        tint="kurenai"
        figure="+30"
        unit="%"
        figureLabel="de trafic organique"
        mission="Une expérience web."
        action="Lire le cas client"
      />,
    );

    await expect.element(screen.getByText("Groupe Vicat")).toBeVisible();
  });

  it("lays the delivered product under the tint as the card's ground", async () => {
    const screen = await render(tf1());

    expect(screen.container.querySelector("[data-slot=case-card] img")).not.toBeNull();
  });

  it("shows the key figure at rest and the mission under the pointer", async () => {
    const screen = await render(tf1());
    const link = screen.getByRole("link");
    expect(opacityOf(stat(screen.container))).toBe("1");
    expect(opacityOf(mission(screen.container))).toBe("1");
    expect(opacityOf(firstWord(screen.container))).toBe("0");

    await userEvent.hover(link);

    await expect.poll(() => opacityOf(stat(screen.container))).toBe("0");
    await expect.poll(() => opacityOf(firstWord(screen.container))).toBe("1");
  });

  it("brings the mission up on keyboard focus too", async () => {
    const screen = await render(tf1());

    await userEvent.tab();

    await expect.poll(() => opacityOf(firstWord(screen.container))).toBe("1");
  });

  it("folds its corner at rest and folds it further under the pointer", async () => {
    const screen = await render(tf1());
    const link = screen.getByRole("link");
    const rest = foldOf(link.element());
    expect(rest).toBeGreaterThan(0);

    await userEvent.hover(link);

    await expect.poll(() => foldOf(link.element())).toBeGreaterThan(rest * 1.5);
  });

  it("shows its frame corners on keyboard focus, never under the pointer", async () => {
    const screen = await render(tf1());
    const link = screen.getByRole("link");

    await userEvent.hover(link);
    await pause(SETTLE_MS);
    expect(cornerOpacityOf(link.element())).toBe("0");

    await userEvent.unhover(link);
    await userEvent.tab();
    await expect.poll(() => cornerOpacityOf(link.element())).toBe("1");
  });

  it("sets its key figure large, a step over the phone's text and growing on wider screens", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const phone = await render(tf1());
    const onPhone = figureSizeOf(phone.container);
    await phone.unmount();
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const desktop = await render(tf1());

    expect(onPhone).toBe(64);
    expect(figureSizeOf(desktop.container)).toBeGreaterThan(onPhone);
  });

  it("sets its words in ink on the light Shiro tint and in Kome on the others", async () => {
    const light = await render(tf1("shiro"));
    const ink = getComputedStyle(light.getByRole("link").element()).color;
    await light.unmount();
    const dark = await render(tf1("kurenai"));
    const paper = getComputedStyle(dark.getByRole("link").element()).color;

    expect(ink).not.toBe(paper);
    expect(ink).toBe("rgb(30, 38, 41)");
  });
});
