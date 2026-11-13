import "../src/styles/globals.css";
import { gsap } from "gsap";
import { siGmail, siOdoo } from "simple-icons";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import {
  routinesOf,
  SWEEP,
  sweepAt,
  type WeekTask,
  weekChoreography,
} from "../src/agents/hero-semaine-choreography.ts";
import { measureWeek } from "../src/agents/hero-semaine-measure.ts";
import { HeroSemaine } from "../src/agents/hero-semaine.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";

const tasks: WeekTask[] = [
  {
    id: "thursday",
    day: 3,
    start: 0,
    end: 2,
    title: "Ressaisir les factures",
    routine: { tool: siOdoo, done: "Factures ressaisies", at: "jeu. 09:10" },
  },
  {
    id: "monday-late",
    day: 0,
    start: 12,
    end: 14,
    title: "Répondre au suivi colis",
    routine: { tool: siGmail, done: "Suivis répondus", at: "lun. 15:02" },
  },
  {
    id: "monday-early",
    day: 0,
    start: 0,
    end: 3,
    title: "Relancer les devis",
    routine: { tool: siGmail, done: "Devis relancés", at: "lun. 09:04" },
  },
  { id: "client", day: 1, start: 3, end: 6, title: "Rendez-vous client", note: "Lyon" },
];

/* The tweens of a choreography played on a paused timeline, each with the data attributes of its target. */
interface Step {
  target: string;
  vars: gsap.TweenVars;
  start: number;
  end: number;
}

function attributesOf(element: Element): string {
  return element
    .getAttributeNames()
    .filter((name) => name.startsWith("data-week"))
    .map((name) => `${name}=${element.getAttribute(name) ?? ""}`)
    .join(" ");
}

function stepsOf(timeline: gsap.core.Timeline): Step[] {
  return timeline
    .getChildren(true, true, false)
    .filter((child): child is gsap.core.Tween => child instanceof gsap.core.Tween)
    .flatMap((tween) => {
      return tween
        .targets<unknown>()
        .filter((target): target is Element => target instanceof Element)
        .map((element) => ({
          target: attributesOf(element),
          vars: tween.vars,
          start: tween.startTime(),
          end: tween.endTime(),
        }));
    });
}

function heroRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-slot='hero-semaine']");
}

function playedSteps(): Step[] {
  const timeline = gsap.timeline({ paused: true });
  weekChoreography(tasks, heroRoot())(timeline);
  return stepsOf(timeline);
}

function flightsOf(steps: Step[]): string[] {
  return steps
    .filter((step) => step.target.startsWith("data-week-task=") && step.vars.x !== undefined)
    .map((step) => step.target);
}

function sweepOf(steps: Step[]): Step | undefined {
  return steps.find(
    (step) => step.target.startsWith("data-week-sweep-line=") && step.vars.x !== undefined,
  );
}

function flightScales(steps: Step[]): string[] {
  return steps
    .filter((step) => step.target.startsWith("data-week-task=") && step.vars.x !== undefined)
    .map((step) => typeof step.vars.scale);
}

function stretched(steps: Step[]): boolean {
  return steps.some((step) => step.vars.scaleX !== undefined || step.vars.scaleY !== undefined);
}

function taskById(id: string): WeekTask {
  const task = tasks.find((candidate) => candidate.id === id);
  if (task === undefined) {
    throw new Error(`No task ${id}`);
  }
  return task;
}

afterEach(async () => {
  await allowMotion();
  await page.viewport(1280, 800);
});

function Hero() {
  return (
    <Direction name="agents">
      <HeroSemaine
        eyebrow="Agents IA sur mesure"
        headline={{
          context: "Vos outils travaillent ensemble.",
          lead: "Vous retrouvez votre",
          before: "semaine.",
          after: "temps.",
        }}
        lead="Les agents reprennent les tâches qui se répètent."
        backdrop={<img alt="" />}
        actions={<a href="#contact">Réserver un diagnostic</a>}
        calendar={{
          title: "Agenda",
          context: "Semaine du 9 novembre",
          status: "Agent en service",
          days: ["Lun. 9", "Mar. 10", "Mer. 11", "Jeu. 12", "Ven. 13"],
          free: "Libre",
          hours: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
        }}
        tasks={tasks}
        journal={{
          title: "Journal de l’agent",
          idle: "Prêt à reprendre vos tâches lundi 09:00",
          approval: {
            initials: "CM",
            text: "Facture Métallerie Rhône-Alpes",
            detail: "4 812,60 € · Claire M.",
            status: "À valider",
          },
        }}
      />
    </Direction>
  );
}

describe("sweepAt", () => {
  it("meets the week in order: a day's morning, its afternoon, then the next day", () => {
    expect(sweepAt(taskById("monday-early"))).toBeLessThan(sweepAt(taskById("monday-late")));
    expect(sweepAt(taskById("monday-late"))).toBeLessThan(sweepAt(taskById("thursday")));
    expect(sweepAt(taskById("monday-early"))).toBeGreaterThan(0);
    expect(sweepAt(taskById("thursday"))).toBeLessThan(1);
  });
});

describe("weekChoreography", () => {
  it("sweeps at the scroll's own pace and takes the routines in the order it meets them", async () => {
    await render(<Hero />);
    const steps = playedSteps();
    const sweep = sweepOf(steps);
    expect(sweep?.vars.ease).toBe("none");
    expect(sweep?.start).toBeCloseTo(SWEEP.start);
    expect(flightsOf(steps)).toEqual([
      "data-week-task=monday-early",
      "data-week-task=monday-late",
      "data-week-task=thursday",
    ]);
    expect(steps.some((step) => step.target === "data-week-task=client")).toBe(false);
  });

  it("lands every row before the word changes and fits the whole story in the hold", async () => {
    await render(<Hero />);
    const steps = playedSteps();
    const rows = steps.filter((step) => step.target.startsWith("data-week-row="));
    expect(rows).toHaveLength(3);
    const word = steps.find((step) => step.target === "data-week-word=after");
    expect(word?.start).toBeGreaterThan(Math.max(...rows.map((step) => step.end)));
    expect(Math.max(...steps.map((step) => step.end))).toBeLessThanOrEqual(1);
  });
});

describe("weekChoreography, the craft", () => {
  it("never blurs, and flies a band without text at one scale", async () => {
    await render(<Hero />);
    const steps = playedSteps();
    expect(steps.some((step) => step.vars.filter !== undefined)).toBe(false);
    expect(flightScales(steps)).toEqual(["number", "number", "number"]);
    expect(stretched(steps)).toBe(false);
    expect(steps.filter((step) => step.target === "data-week-label=true")).toHaveLength(3);
  });

  it("frees each slot as its routine leaves", async () => {
    await render(<Hero />);
    const steps = playedSteps();
    expect(steps.filter((step) => step.target.startsWith("data-week-free="))).toHaveLength(3);
  });
});

describe("measureWeek", () => {
  it("measures every routine once and keeps each landing line in the journal's view", async () => {
    await render(<Hero />);
    const ids = routinesOf(tasks).map((task) => task.id);
    const measure = measureWeek(heroRoot(), ids);
    expect([...measure.landings.keys()]).toEqual(ids);
    expect(measure.sweep).toBeGreaterThan(0);
    const shifts = [...measure.landings.values()].map((landing) => landing.shift);
    expect(shifts).toEqual([...shifts].toSorted((a, b) => a - b));
  });
});

describe("HeroSemaine", () => {
  it("names the heading with its final sentence and paints the full week first", async () => {
    const screen = await render(<Hero />);
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toHaveAccessibleName("Vos outils travaillent ensemble. Vous retrouvez votre temps.");
    await expect.element(screen.getByText("Ressaisir les factures").first()).toBeVisible();
    await expect.element(screen.getByText("Rendez-vous client")).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "Réserver un diagnostic" }))
      .toBeVisible();
  });

  it("shows before and after under reduced motion: routines ticked, their slots free, the journal full", async () => {
    await preferReducedMotion();
    const screen = await render(<Hero />);
    await expect.element(screen.getByText("Factures ressaisies")).toBeVisible();
    await expect.element(screen.getByText("Facture Métallerie Rhône-Alpes")).toBeVisible();
    await expect.element(screen.getByText("Rendez-vous client")).toBeVisible();
    await expect.element(screen.getByText("Libre · 1 h 30").last()).toBeVisible();
  });
});
