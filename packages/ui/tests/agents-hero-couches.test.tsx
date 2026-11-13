import "../src/styles/globals.css";
import { gsap } from "gsap";
import { siGmail, siHubspot, siOdoo } from "simple-icons";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { explodeLayers } from "../src/agents/hero-couches-choreography.ts";
import { HeroCouches } from "../src/agents/hero-couches.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

const props = {
  copy: <h1>Une interface pour vos outils</h1>,
  backdrop: <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />,
  labels: {
    you: {
      index: "01 · Vous",
      title: "Vous validez ce qui compte",
      detail: "Une seule interface.",
    },
    agents: {
      index: "02 · Les agents",
      title: "Ils agissent dans vos outils",
      detail: "Un agent par process.",
    },
    tools: {
      index: "03 · Vos outils",
      title: "Rien à remplacer",
      detail: "Vos outils restent en place.",
    },
  },
  workspace: {
    title: "Espace de travail",
    context: "SHUNPO",
    status: "En service",
    heading: "Aujourd’hui",
    tasks: [
      { icon: siGmail, text: "Facture lue", time: "09:42", tone: "done", status: "Fait" },
      {
        icon: siOdoo,
        text: "Brouillon créé",
        time: "09:43",
        tone: "working",
        status: "En cours",
        settled: "Fait",
      },
    ],
    aside: "Attend votre validation",
    approval: <p>Approuver la facture</p>,
    approved: {
      reason: "Montant supérieur à 2 000 €",
      detail: "Métallerie Rhône-Alpes · 4 812,60 € TTC",
      outcome: "Approuvé par Claire M. · 09:44",
      initials: "CM",
    },
  },
  agents: [
    { name: "Agent factures", role: "Comptabilité", doing: "Lit une facture" },
    { name: "Agent support", role: "Service client", doing: "Répond" },
    { name: "Agent ventes", role: "Commercial", doing: "Relance" },
  ],
  tools: [
    [siGmail, siOdoo],
    [siHubspot, siGmail],
    [siOdoo, siHubspot],
  ],
  target: siOdoo.slug,
} as const;

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  await allowMotion();
});

/* The z translation GSAP wrote on a plane, 0 when none. */
function depthOf(container: HTMLElement, plane: string): number {
  const element = container.querySelector<HTMLElement>(`[data-couches-plane='${plane}']`);
  return Number(gsap.getProperty(element, "z"));
}

describe("HeroCouches", () => {
  it("reads as three labelled layers under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(<HeroCouches {...props} />);
    releaseIdleCallbacks();
    await expect.element(screen.getByRole("heading", { level: 1 })).toBeVisible();
    await Promise.all(
      Object.values(props.labels).map(async (label) => {
        await expect.element(screen.getByText(label.title).first()).toBeVisible();
      }),
    );
    await expect.element(screen.getByText("Agent factures")).toBeVisible();
    /* The decision and the routed task show where they end. */
    await expect.element(screen.getByText("Approuvé par Claire M. · 09:44")).toBeVisible();
    await expect.element(screen.getByText("Fait").nth(1)).toBeVisible();
  });

  it("stacks the layers in reading order on phones", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(<HeroCouches {...props} />);
    const you = screen
      .getByText("Approuvé par Claire M. · 09:44")
      .element()
      .getBoundingClientRect();
    const tools = screen.container.querySelector("[data-couches-plane='tools']");
    expect(tools).not.toBeNull();
    expect(tools?.getBoundingClientRect().top).toBeGreaterThan(you.bottom);
  });

  it("parts the planes in the middle of the hold and closes them flat at the end", async () => {
    const screen = await render(<HeroCouches {...props} />);
    const timeline = gsap.timeline({ paused: true });
    explodeLayers(timeline);
    expect(timeline.duration()).toBeCloseTo(1);

    timeline.progress(0.6);
    const agents = depthOf(screen.container, "agents");
    expect(agents).toBeGreaterThan(40);
    expect(depthOf(screen.container, "you")).toBeCloseTo(agents * 2, 0);

    timeline.progress(1);
    expect(depthOf(screen.container, "you")).toBeLessThan(4);
    const approved = screen.container.querySelector("[data-couches='approved']");
    expect(Number(gsap.getProperty(approved, "opacity"))).toBe(1);
    const tilt = screen.container.querySelector("[data-couches='tilt']");
    expect(Number(gsap.getProperty(tilt, "rotationX"))).toBe(0);
    timeline.kill();
  });

  it("leaves the copy painted until the scroll starts", async () => {
    const screen = await render(<HeroCouches {...props} />);
    const timeline = gsap.timeline({ paused: true });
    explodeLayers(timeline);
    timeline.progress(0);
    const copy = screen.container.querySelector("[data-couches='copy']");
    expect(Number(gsap.getProperty(copy, "opacity"))).toBe(1);
    timeline.progress(0.3);
    expect(Number(gsap.getProperty(copy, "opacity"))).toBe(0);
    timeline.kill();
  });
});
