import { describe, expect, it } from "vitest";

import {
  answerTo,
  decisionsOf,
  journalOf,
  type OsDecision,
  type OsLine,
  type OsQuestion,
  type OsView,
  pendingOf,
} from "../src/agents/os-model.ts";

const tool = { slug: "gmail", title: "Gmail", hex: "EA4335", path: "M0 0h24v24H0z" };

function line(text: string): OsLine {
  return { at: "07:52", tool, text };
}

function decision(id: string, area: OsDecision["area"]): OsDecision {
  return {
    id,
    area,
    title: `Décision ${id}`,
    detail: "Détail",
    reason: "Au-delà de votre seuil",
    action: "Valider",
    follow: line(`Suite de ${id}`),
  };
}

const decisions = [decision("payer", "finance"), decision("devis", "sales")];

function view(area: OsView["area"]): OsView {
  return {
    area,
    label: area,
    brief: "Le point.",
    figures: [],
    journal: [line(`Journal ${area}`)],
  };
}

describe("decisions of an area", () => {
  it("gives the morning view every decision, and each area its own", () => {
    expect(decisionsOf("today", decisions).map((item) => item.id)).toEqual(["payer", "devis"]);
    expect(decisionsOf("finance", decisions).map((item) => item.id)).toEqual(["payer"]);
    expect(decisionsOf("team", decisions)).toEqual([]);
  });

  it("counts what still waits on the owner", () => {
    expect(pendingOf("today", decisions, [])).toBe(2);
    expect(pendingOf("today", decisions, ["payer"])).toBe(1);
    expect(pendingOf("finance", decisions, ["payer"])).toBe(0);
    expect(pendingOf("sales", decisions, ["payer"])).toBe(1);
  });
});

describe("journal of a view", () => {
  it("puts what the agents did after each decision on top, newest first", () => {
    expect(journalOf(view("finance"), decisions, []).map((item) => item.text)).toEqual([
      "Journal finance",
    ]);
    expect(
      journalOf(view("today"), decisions, ["devis", "payer"]).map((item) => item.text),
    ).toEqual(["Suite de payer", "Suite de devis", "Journal today"]);
    expect(journalOf(view("sales"), decisions, ["payer"]).map((item) => item.text)).toEqual([
      "Journal sales",
    ]);
  });

  it("leaves a view without a journal empty", () => {
    expect(journalOf({ ...view("agents"), journal: undefined }, decisions, [])).toEqual([]);
  });
});

describe("answer to a question", () => {
  const cash: OsQuestion = {
    id: "tresorerie",
    ask: "Où en est ma trésorerie ?",
    keywords: ["tresor", "banque", "cash"],
    answer: "212 300 € ce matin.",
    sources: ["QuickBooks"],
  };
  const fallback: OsQuestion = {
    id: "autre",
    ask: "",
    keywords: [],
    answer: "Prototype.",
    sources: [],
  };

  it("finds the question by a keyword, accents and capitals aside, and keeps the owner's words", () => {
    const answer = answerTo("Combien de TRÉSORERIE ?", [cash], fallback);
    expect(answer.id).toBe("tresorerie");
    expect(answer.ask).toBe("Combien de TRÉSORERIE ?");
  });

  it("falls back when nothing matches", () => {
    const answer = answerTo("La météo de demain", [cash], fallback);
    expect(answer.id).toBe("autre");
    expect(answer.ask).toBe("La météo de demain");
  });
});
