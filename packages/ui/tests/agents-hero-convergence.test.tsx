import "../src/styles/globals.css";
import { gsap } from "gsap";
import { siGmail, siHubspot, siOdoo } from "simple-icons";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { convergeChoreography } from "../src/agents/hero-convergence-choreography.ts";
import { type ConvergeTool, HeroConvergence } from "../src/agents/hero-convergence.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";

const tools: ConvergeTool[] = [
  {
    id: "gmail",
    icon: siGmail,
    app: "Gmail",
    context: "Boîte de réception",
    title: "Métallerie Rhône-Alpes",
    detail: "Facture F-2026-1184",
    fields: [{ label: "Pièce jointe", value: "F-2026-1184.pdf" }],
    task: "Facture lue, brouillon créé",
    meta: "Gmail · 09:42",
    status: { tone: "done", label: "Fait" },
  },
  {
    id: "hubspot",
    icon: siHubspot,
    app: "HubSpot",
    context: "Transactions",
    title: "Atelier Brunel",
    detail: "Devis envoyé",
    fields: [{ label: "Étape", value: "Devis envoyé" }],
    task: "Relance du devis envoyée",
    meta: "HubSpot · 09:44",
    status: { tone: "done", label: "Fait" },
  },
  {
    id: "odoo",
    icon: siOdoo,
    app: "Odoo",
    context: "Factures fournisseurs",
    title: "FACT/2026/0918",
    detail: "Brouillon",
    fields: [{ label: "Total TTC", value: "4 812,60 €" }],
    task: "Facture à approuver",
    meta: "Odoo · 09:45",
    status: { tone: "waiting", label: "À valider", owner: "CM" },
  },
];

function Hero() {
  return (
    <HeroConvergence
      copy={<h1>Une interface pour vos outils</h1>}
      workspace={{ title: "Espace de travail", context: "Lundi matin", status: "En service" }}
      tools={tools}
      caption="Chaque action reste tracée."
    />
  );
}

function scene(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>("[data-slot='hero-convergence']");
  if (root === null) {
    throw new Error("No hero");
  }
  return root;
}

/* The scene's element for a selector; a missing one fails the test that asked for it. */
function part(root: HTMLElement, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`Missing ${selector}`);
  }
  return element;
}

function opacityOf(element: Element): string {
  return getComputedStyle(element).opacity;
}

function centre(element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(1280, 800);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  releaseIdleCallbacks();
  await allowMotion();
});

describe("HeroConvergence", () => {
  it("lists every task of the workspace with its tool and its status", async () => {
    const screen = await render(<Hero />);

    await expect.element(screen.getByRole("heading", { level: 1 })).toBeVisible();
    const list = screen.getByRole("list", { name: "Espace de travail" });
    await expect.element(list).toBeInTheDocument();
    expect(list.element().querySelectorAll("li")).toHaveLength(3);
    await expect.element(screen.getByText("Facture à approuver")).toBeInTheDocument();
    await expect.element(screen.getByText("À valider")).toBeInTheDocument();
  });

  it("keeps the scattered tool windows away from assistive technology", async () => {
    const screen = await render(<Hero />);
    const glimpses = scene(screen.container).querySelector("[data-converge='glimpses']");

    expect(glimpses?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the gathered workspace and no scattered window under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(<Hero />);
    const root = scene(screen.container);

    await expect.element(screen.getByText("Relance du devis envoyée")).toBeVisible();
    expect(getComputedStyle(part(root, "[data-converge='glimpses']")).display).toBe("none");
  });

  it("shows the workspace on a phone, where the scene does not hold", async () => {
    await page.viewport(390, 844);
    const screen = await render(<Hero />);

    await expect.element(screen.getByText("Facture lue, brouillon créé")).toBeVisible();
  });
});

describe("convergeChoreography", () => {
  it("starts from the painted composition and spans the whole scene", async () => {
    const screen = await render(<Hero />);
    const root = scene(screen.container);
    const timeline = gsap.timeline({ paused: true });

    convergeChoreography(timeline, root);
    timeline.progress(0);

    expect(timeline.duration()).toBeCloseTo(1, 5);
    expect(opacityOf(part(root, "[data-converge='copy']"))).toBe("1");
  });

  it("docks each tool window on its row's logo tile, then leaves only the workspace", async () => {
    const screen = await render(<Hero />);
    const root = scene(screen.container);
    const timeline = gsap.timeline({ paused: true });

    convergeChoreography(timeline, root);
    timeline.progress(1);

    expect(opacityOf(part(root, "[data-converge='copy']"))).toBe("0");
    expect(opacityOf(part(root, "[data-converge='workspace']"))).toBe("1");
    for (const tool of tools) {
      const card = part(root, `[data-converge-glimpse='${tool.id}']`);
      const row = part(root, `[data-converge-row='${tool.id}'] [data-converge-tile]`);
      expect(opacityOf(card)).toBe("0");
      expect(centre(card).x).toBeCloseTo(centre(row).x, -1);
      expect(centre(card).y).toBeCloseTo(centre(row).y, -1);
    }
  });

  it("turns every status from in progress to its final word", async () => {
    const screen = await render(<Hero />);
    const root = scene(screen.container);
    const timeline = gsap.timeline({ paused: true });

    convergeChoreography(timeline, root);
    timeline.progress(0.3);
    const working = [...root.querySelectorAll("[data-converge-status='working']")];
    expect(working.map((pill) => opacityOf(pill))).not.toContain("0");

    timeline.progress(1);
    expect(working.map((pill) => opacityOf(pill))).toEqual(["0", "0", "0"]);
    const final = [...root.querySelectorAll("[data-converge-status='final']")];
    expect(final.map((pill) => opacityOf(pill))).toEqual(["1", "1", "1"]);
  });
});
