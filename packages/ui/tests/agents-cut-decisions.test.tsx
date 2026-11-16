import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { ApprovalCard } from "../src/agents/approval-card.tsx";
import { CouchesApproval } from "../src/agents/hero-couches-approval.tsx";
import { OsDecisionCard } from "../src/agents/os-decision.tsx";
import { Direction } from "../src/layout/direction.tsx";
import {
  atDesktop,
  cutOf,
  folded,
  nth,
  neverApprove,
  part,
  roundedElements,
} from "./support/agents-corners.ts";
import { decision } from "./support/agents-note-fixtures.ts";

const KURENAI_PAPER = "rgb(243, 228, 226)";
const TENKU_PAPER = "rgb(227, 235, 238)";

beforeEach(atDesktop);

describe("Decisions", () => {
  it("folds a waiting decision on Kurenai paper, then on Tenku once approved", async () => {
    const screen = await render(
      <Direction name="agents">
        <ApprovalCard reason="Seuil" detail="2 400 €" approve="Approuver" edit="Modifier" />
        <OsDecisionCard decision={decision} decided={false} note="Fait." onApprove={neverApprove} />
        <OsDecisionCard decision={decision} decided note="Fait." onApprove={neverApprove} />
        <CouchesApproval
          approval={null}
          approved={{ reason: "Seuil", detail: "2 400 €", outcome: "Approuvé", initials: "CM" }}
        />
      </Direction>,
    );
    const waitingCard = part(screen.container, "[data-slot=approval-card]");
    const waitingDecision = nth(screen.container, "[data-slot=os-decision]", 0);
    const doneDecision = nth(screen.container, "[data-slot=os-decision]", -1);
    const approved = part(screen.container, "[data-couches=approved]");

    for (const note of [waitingCard, waitingDecision]) {
      expect(cutOf(note)).toBe("16px");
      expect(folded(note)).toBe(true);
      expect(getComputedStyle(note, "::after").backgroundColor).toBe(KURENAI_PAPER);
    }
    for (const note of [doneDecision, approved]) {
      expect(cutOf(note)).toBe("16px");
      expect(folded(note)).toBe(true);
      expect(getComputedStyle(note, "::after").backgroundColor).toBe(TENKU_PAPER);
    }
    expect(roundedElements(screen.container)).toEqual([]);
  });
});
