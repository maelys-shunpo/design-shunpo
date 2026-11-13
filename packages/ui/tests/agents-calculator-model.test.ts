import { describe, expect, it } from "vitest";

import {
  type CalculatorModel,
  answeredAll,
  clampHourly,
  resultOf,
} from "../src/agents/calculator-model.ts";

const hours = [
  { value: "lt1", label: "Moins d’1 h", amount: 0.5 },
  { value: "1-3", label: "1 à 3 h", amount: 2 },
  { value: "3-5", label: "3 à 5 h", amount: 4 },
  { value: "5-8", label: "5 à 8 h", amount: 6.5 },
  { value: "gt8", label: "Plus de 8 h", amount: 8 },
];

const model: CalculatorModel = {
  team: "team",
  tasks: [
    { question: "entry", rate: 0.5, title: "Collecte" },
    { question: "typing", rate: 0.4, title: "Saisie" },
    { question: "chasing", rate: 0.6, title: "Relances" },
    { question: "mail", rate: 0.3, title: "Emails" },
    { question: "reports", rate: 0.5, title: "Reportings" },
  ],
  questions: [
    {
      id: "team",
      prompt: "Combien de personnes ?",
      kind: "single",
      options: [
        { value: "1-5", label: "1 à 5", amount: 3 },
        { value: "6-15", label: "6 à 15", amount: 10 },
      ],
    },
    ...["entry", "typing", "chasing", "mail", "reports"].map((id) => ({
      id,
      prompt: id,
      kind: "single" as const,
      options: hours,
    })),
    {
      id: "tools",
      prompt: "Vos outils",
      kind: "multi",
      options: [
        { value: "erp", label: "ERP" },
        { value: "excel", label: "Excel" },
      ],
    },
  ],
};

/* The worked example of the calculator's brief: 10 people, 3 to 5 h of entry and of typing, 1 to 3 h of chasing,
   mail and reports per person and per week. */
const example = {
  team: ["6-15"],
  entry: ["3-5"],
  typing: ["3-5"],
  chasing: ["1-3"],
  mail: ["1-3"],
  reports: ["1-3"],
  tools: ["excel"],
};

describe("resultOf", () => {
  it("finds the brief's worked example: 140 h spent, 64 h recoverable a week", () => {
    const result = resultOf(model, example, 33);

    expect(result.weeklySpent).toBe(140);
    expect(result.weeklyRecoverable).toBe(64);
  });

  it("turns the recoverable week into a year, its cost and full-time equivalents, rounded down", () => {
    const result = resultOf(model, example, 33);

    expect(result.yearlyHours).toBe(2880);
    expect(result.yearlyCost).toBe(95_000);
    expect(result.fullTime).toBe(1.7);
  });

  it("follows the hourly cost the visitor sets", () => {
    expect(resultOf(model, example, 40).yearlyCost).toBe(115_000);
  });

  it("ranks the three tasks that give back the most hours, with their weekly hours", () => {
    const { sources } = resultOf(model, example, 33);

    expect(sources.map((source) => source.title)).toEqual(["Collecte", "Saisie", "Relances"]);
    expect(sources.map((source) => source.weeklyHours)).toEqual([20, 16, 12]);
  });

  it("flags answers that add up to almost a whole working week instead of trusting them", () => {
    const flooded = {
      ...example,
      entry: ["gt8"],
      typing: ["gt8"],
      chasing: ["gt8"],
      mail: ["gt8"],
    };

    expect(resultOf(model, flooded, 33).implausible).toBe(true);
    expect(resultOf(model, example, 33).implausible).toBe(false);
  });

  it("rounds a small cost down to the hundred", () => {
    const small = {
      ...example,
      team: ["1-5"],
      entry: ["lt1"],
      typing: ["lt1"],
      chasing: ["lt1"],
      mail: ["lt1"],
      reports: ["lt1"],
    };

    // 3 people × 0.5 h × Σ rates (2.3) × 45 weeks × 33 € = 5 123 €, down to the hundred.
    expect(resultOf(model, small, 33).yearlyCost).toBe(5_100);
  });
});

describe("answeredAll", () => {
  it("is true only once every question has at least one answer", () => {
    expect(answeredAll(model, example)).toBe(true);
    expect(answeredAll(model, { ...example, tools: [] })).toBe(false);
  });
});

describe("clampHourly", () => {
  it("keeps the hourly cost between 25 and 45 €", () => {
    expect(clampHourly(12)).toBe(25);
    expect(clampHourly(33)).toBe(33);
    expect(clampHourly(80)).toBe(45);
  });
});
