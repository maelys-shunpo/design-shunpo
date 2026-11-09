import "../src/styles/globals.css";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import { CaseCard } from "../src/agents/case-card.tsx";
import { Eyebrow } from "../src/agents/eyebrow.tsx";
import { NavAnchor } from "../src/agents/nav-anchor.tsx";
import { NightPlate } from "../src/agents/night-plate.tsx";

/* The corner a frame draws, read on the pseudo-element: shown or not, and which two sides it strokes. */
function corner(element: Element, pseudo: "::before" | "::after") {
  const style = getComputedStyle(element, pseudo);
  return {
    opacity: style.opacity,
    top: style.borderTopWidth !== "0px",
    bottom: style.borderBottomWidth !== "0px",
    left: style.borderLeftWidth !== "0px",
    right: style.borderRightWidth !== "0px",
  };
}

describe("Section labels", () => {
  it("label a section in plain words: no symbol, no capitals, no monospace", async () => {
    const screen = await render(<Eyebrow>Agents IA sur mesure</Eyebrow>);
    const label = screen.getByText("Agents IA sur mesure").element();
    const style = getComputedStyle(label);

    expect(label.querySelector("svg")).toBeNull();
    expect(style.textTransform).toBe("none");
    expect(style.fontFamily.toLowerCase()).not.toContain("mono");
  });

  it("name a pain on its plate without a number", async () => {
    const screen = await render(
      <NightPlate title="Vous ressaisissez" text="Un devis, une facture." />,
    );

    await expect.element(screen.getByRole("heading", { name: "Vous ressaisissez" })).toBeVisible();
    expect(screen.container.textContent).not.toMatch(/\d/u);
  });

  it("set a case's project in the text face, not in monospace capitals", async () => {
    const screen = await render(
      <CaseCard
        href="#tf1"
        client="TF1"
        project="Application de jeu"
        stake="Un prime time"
        action="Lire le cas client"
      />,
    );
    const project = screen.getByText("Application de jeu").element();

    expect(getComputedStyle(project).textTransform).toBe("none");
    expect(getComputedStyle(project).fontFamily.toLowerCase()).not.toContain("mono");
  });
});

describe("The two-corner frame", () => {
  it("stays out of sight until a link is designated", async () => {
    const screen = await render(<NavAnchor href="#methode">Méthode</NavAnchor>);
    const link = screen.getByRole("link", { name: "Méthode" }).element();

    expect(corner(link, "::before").opacity).toBe("0");
    expect(corner(link, "::after").opacity).toBe("0");
  });

  it("designates a focused link with two opposite corners, never four", async () => {
    const screen = await render(<NavAnchor href="#methode">Méthode</NavAnchor>);
    const link = screen.getByRole("link", { name: "Méthode" }).element();

    await userEvent.tab();

    await expect.poll(() => corner(link, "::before").opacity).toBe("1");
    expect(corner(link, "::before")).toMatchObject({
      top: true,
      left: true,
      bottom: false,
      right: false,
    });
    expect(corner(link, "::after")).toMatchObject({
      opacity: "1",
      top: false,
      left: false,
      bottom: true,
      right: true,
    });
  });

  it("designates a focused case card the same way", async () => {
    const screen = await render(
      <CaseCard
        href="#tf1"
        client="TF1"
        project="Application de jeu"
        stake="Un prime time"
        action="Lire le cas client"
      />,
    );
    const card = screen.getByRole("link").element();

    await userEvent.tab();

    await expect.poll(() => corner(card, "::before").opacity).toBe("1");
    expect(corner(card, "::after").opacity).toBe("1");
  });
});
