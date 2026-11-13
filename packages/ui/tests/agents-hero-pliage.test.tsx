import "../src/styles/globals.css";
import { gsap } from "gsap";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { pliageChoreography } from "../src/agents/hero-pliage-choreography.ts";
import {
  finalPlacement,
  foldMatrix,
  foldValues,
  placementTransform,
  type Point,
  SHEET,
  STAR_TRANSFORM,
} from "../src/agents/hero-pliage-geometry.ts";
import { HeroPliage, type PliageTool } from "../src/agents/hero-pliage.tsx";
import { STAR } from "../src/brand/shuriken-paths.ts";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";

/* A plain square stands for each tool's mark. */
const MARK = "M4 4h16v16H4z";

const tools: PliageTool[] = [
  { id: "gmail", label: "Messagerie", icon: { title: "Gmail", path: MARK }, paper: "white" },
  { id: "hubspot", label: "CRM", icon: { title: "HubSpot", path: MARK }, paper: "shiro" },
  { id: "odoo", label: "ERP", icon: { title: "Odoo", path: MARK }, paper: "frost" },
  { id: "sheets", label: "Tableur", icon: { title: "Sheets", path: MARK }, paper: "tenku" },
];

function Hero() {
  return (
    <HeroPliage
      copy={<h1>Une interface pour faire travailler vos outils ensemble</h1>}
      tools={tools}
      label="Quatre feuilles se plient en un seul signe"
      caption={{ before: "4 outils", after: "1 système" }}
    />
  );
}

/* The SHUNPO star drawn in the figure's own units, to ask the browser whether a point falls inside it. */
function starProbe(): SVGPathElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", STAR);
  path.setAttribute("fill-rule", "evenodd");
  svg.append(path);
  document.body.append(svg);
  return path;
}

/* A point of a sheet, once the sheet sits in its final place in the star, in the figure's units. */
function placed(point: Point, index: number): DOMPoint {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.append(group);
  document.body.append(svg);
  group.setAttribute("transform", placementTransform(finalPlacement(index)));
  const matrix = group.transform.baseVal.consolidate()?.matrix ?? new DOMMatrix();
  svg.remove();
  return new DOMPoint(point[0], point[1]).matrixTransform(matrix);
}

/* The same point back in the star's own units, where STAR is drawn. */
function inStarUnits(point: DOMPoint): DOMPoint {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.append(group);
  document.body.append(svg);
  group.setAttribute("transform", STAR_TRANSFORM);
  const matrix = group.transform.baseVal.consolidate()?.matrix ?? new DOMMatrix();
  svg.remove();
  return point.matrixTransform(matrix.inverse());
}

function towards(from: Point, to: Point, share: number): Point {
  return [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];
}

function scene(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>("[data-slot='hero-pliage']");
  if (root === null) {
    throw new Error("No hero");
  }
  return root;
}

function part(root: Element, selector: string): Element {
  const element = root.querySelector(selector);
  if (element === null) {
    throw new Error(`Missing ${selector}`);
  }
  return element;
}

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(1280, 800);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  releaseIdleCallbacks();
  await allowMotion();
  for (const svg of document.querySelectorAll("body > svg")) {
    svg.remove();
  }
});

describe("the folded sheet", () => {
  it("folds each flap over its crease onto the kite", () => {
    const fold = new DOMMatrix(foldValues(SHEET.tip, SHEET.creaseRight, -1));
    const landed = new DOMPoint(...SHEET.corner).matrixTransform(fold);

    expect(landed.x).toBeCloseTo(SHEET.folded[0], 5);
    expect(landed.y).toBeCloseTo(SHEET.folded[1], 5);
    expect(Math.abs(landed.x)).toBeLessThan(SHEET.creaseRight[0]);
  });

  it("lands the four kites on the branches of the SHUNPO star", () => {
    const star = starProbe();
    for (const index of [0, 1, 2, 3]) {
      const inside = [
        towards(SHEET.tip, SHEET.centre, 0.12),
        towards(SHEET.creaseRight, SHEET.centre, 0.1),
        towards(SHEET.creaseLeft, SHEET.centre, 0.1),
        towards(SHEET.tip, SHEET.centre, 0.6),
      ];
      for (const point of inside) {
        const probe = inStarUnits(placed(point, index));
        expect(star.isPointInFill(probe)).toBe(true);
      }
      const beyondTip = inStarUnits(placed(towards(SHEET.centre, SHEET.tip, 1.08), index));
      expect(star.isPointInFill(beyondTip)).toBe(false);
      const beyondSide = inStarUnits(placed(towards(SHEET.centre, SHEET.creaseRight, 1.15), index));
      expect(star.isPointInFill(beyondSide)).toBe(false);
    }
  });
});

describe("HeroPliage", () => {
  it("reads the promise once and names the figure", async () => {
    const screen = await render(<Hero />);

    expect(screen.container.querySelectorAll("h1")).toHaveLength(1);
    await expect
      .element(screen.getByRole("img", { name: "Quatre feuilles se plient en un seul signe" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("1 système", { exact: true }).first())
      .toBeInTheDocument();
  });

  it("paints four flat sheets before the scroll, each with its tool", async () => {
    const screen = await render(<Hero />);
    const root = scene(screen.container);
    const sheets = root.querySelectorAll("[data-pliage-animated] [data-pliage-sheet]");

    expect(sheets).toHaveLength(4);
    expect(getComputedStyle(part(root, "[data-pliage-animated]")).display).not.toBe("none");
    expect(
      part(root, "[data-pliage-animated] [data-pliage-flap='right']").getAttribute("transform"),
    ).toBe(foldMatrix(SHEET.tip, SHEET.creaseRight, 1));
  });

  it("shows the folded sign and its last word under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(<Hero />);
    const root = scene(screen.container);

    expect(getComputedStyle(part(root, "[data-pliage-animated]")).display).toBe("none");
    expect(getComputedStyle(part(root, "[data-pliage-still]")).display).not.toBe("none");
    expect(root.querySelector("[data-pliage-still] [data-pliage-word='before']")).toBeNull();
    expect(
      getComputedStyle(part(root, "[data-pliage-still] [data-pliage-word='after']")).opacity,
    ).toBe("1");
  });
});

describe("pliageChoreography", () => {
  it("starts from the painted sheets and spans the whole scene", async () => {
    const screen = await render(<Hero />);
    const root = scene(screen.container);
    const sheet = part(root, "[data-pliage-animated] [data-pliage-sheet='0']");
    const painted = sheet.getAttribute("transform");
    const timeline = gsap.timeline({ paused: true });

    pliageChoreography(timeline, root);
    timeline.progress(0);

    expect(timeline.duration()).toBeCloseTo(1, 5);
    expect(sheet.getAttribute("transform")).toBe(painted);
  });

  it("folds one sheet at a time, then gathers the kites, the pebble, the hole and the turn", async () => {
    const screen = await render(<Hero />);
    const root = scene(screen.container);
    const timeline = gsap.timeline({ paused: true });
    pliageChoreography(timeline, root);
    function flap(index: number): Element {
      return part(
        root,
        `[data-pliage-animated] [data-pliage-sheet='${String(index)}'] [data-pliage-flap='right']`,
      );
    }

    timeline.progress(0.1);
    expect(flap(0).getAttribute("transform")).not.toBe(foldMatrix(SHEET.tip, SHEET.creaseRight, 1));
    expect(flap(3).getAttribute("transform")).toBe(foldMatrix(SHEET.tip, SHEET.creaseRight, 1));

    timeline.progress(1);
    for (const index of [0, 1, 2, 3]) {
      expect(flap(index).getAttribute("transform")).toBe(
        foldMatrix(SHEET.tip, SHEET.creaseRight, -1),
      );
      const sheet = part(root, `[data-pliage-animated] [data-pliage-sheet='${index}']`);
      const still = part(root, `[data-pliage-still] [data-pliage-sheet='${index}']`);
      expect(sheet.getAttribute("transform")).toBe(still.getAttribute("transform"));
      expect(part(sheet, "[data-pliage-mark]").getAttribute("transform")).toBe(
        part(still, "[data-pliage-mark]").getAttribute("transform"),
      );
    }
    expect(
      part(root, "[data-pliage-animated] [data-pliage='pebble']").getAttribute("opacity"),
    ).toBe("1");
    expect(
      part(root, "[data-pliage-animated] [data-pliage='star']").getAttribute("transform"),
    ).toBe(part(root, "[data-pliage-still] [data-pliage='star']").getAttribute("transform"));
    expect(
      getComputedStyle(part(root, "[data-pliage-animated] [data-pliage-word='after']")).opacity,
    ).toBe("1");
  });
});
