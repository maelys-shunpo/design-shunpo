import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { ChatBubble } from "../src/agents/chat-bubble.tsx";
import { RecordCard } from "../src/agents/record-card.tsx";
import { WorkflowNode } from "../src/agents/workflow-node.tsx";
import { Direction } from "../src/layout/direction.tsx";
import { atDesktop, cutOf, nth, part, roundedElements } from "./support/agents-corners.ts";

const CUT_AT_TOP_LEFT = /^polygon\(10px 0px/u;

function clipOf(bubble: Element): string {
  return getComputedStyle(bubble, "::before").clipPath;
}

function lineOf(bubble: Element): string {
  return getComputedStyle(bubble, "::before").backgroundColor;
}

function fillOf(bubble: Element): string {
  return getComputedStyle(bubble, "::after").backgroundColor;
}

beforeEach(atDesktop);

describe("Interface pieces and bubbles", () => {
  it("cuts workflow nodes 12 px and record cards 16 px, without a fold", async () => {
    const screen = await render(
      <Direction name="agents">
        <ul>
          <WorkflowNode kind="Agent IA" title="Lire" agent />
        </ul>
        <RecordCard name="Claire" initials="CM" subtitle="Lyon">
          <span>Champ</span>
        </RecordCard>
      </Direction>,
    );
    const node = part(screen.container, "[data-slot=workflow-node] > div");
    const record = part(screen.container, "[data-slot=record-card]");

    expect(cutOf(node)).toBe("12px");
    expect(cutOf(record)).toBe("16px");
    for (const sheet of [node, record]) {
      expect(getComputedStyle(sheet, "::after").backgroundImage).toBe("none");
    }
    expect(roundedElements(screen.container)).toEqual([]);
  });

  it("cuts each bubble on its speaker's side", async () => {
    const screen = await render(
      <Direction name="agents">
        <ChatBubble from="customer" author="Vous">
          Bonjour
        </ChatBubble>
        <ChatBubble from="agent" author="L’agent">
          Voici
        </ChatBubble>
        <ChatBubble from="human" author="Claire">
          Je prends
        </ChatBubble>
      </Direction>,
    );
    const customer = nth(screen.container, "[data-slot=chat-bubble]", 0);
    const agent = nth(screen.container, "[data-slot=chat-bubble]", 1);
    const human = nth(screen.container, "[data-slot=chat-bubble]", 2);

    for (const bubble of [customer, agent, human]) {
      expect(cutOf(bubble)).toBe("10px");
    }
    expect(clipOf(customer)).not.toMatch(CUT_AT_TOP_LEFT);
    expect(clipOf(agent)).toMatch(CUT_AT_TOP_LEFT);
    expect(clipOf(human)).toMatch(CUT_AT_TOP_LEFT);
    expect(lineOf(customer)).toBe(fillOf(customer));
    expect(lineOf(human)).toBe(fillOf(human));
    expect(lineOf(agent)).not.toBe(fillOf(agent));
    expect(roundedElements(screen.container)).toEqual([]);
  });
});
