import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { AgentsPlane } from "../src/agents/hero-couches-layers.tsx";
import { JournalPanel } from "../src/agents/hero-semaine-journal.tsx";
import { MailRow } from "../src/agents/mail-row.tsx";
import { ToolCall } from "../src/agents/tool-call.tsx";
import { Direction } from "../src/layout/direction.tsx";
import {
  atDesktop,
  boxesUnder,
  parentOf,
  part,
  roundedElements,
  shadowOf,
} from "./support/agents-corners.ts";
import { weekJournal, weekTask } from "./support/agents-note-fixtures.ts";

beforeEach(atDesktop);

describe("Rows", () => {
  it("splits rows with hairlines, never boxes", async () => {
    const screen = await render(
      <Direction name="agents">
        <MailRow from="Métallerie" subject="Facture" time="09:42" attachment="F-1184.pdf" />
        <ToolCall tool="Gmail" action="Envoyer" />
        <JournalPanel journal={weekJournal} routines={[weekTask]} />
        <AgentsPlane agents={[{ name: "Agent factures", role: "Comptabilité", doing: "Lit" }]} />
      </Direction>,
    );
    const rows = [
      "[data-slot=mail-row]",
      "[data-slot=tool-call]",
      "[data-week-row]",
      "[data-couches-plane=agents] li",
    ].map((selector) => part(screen.container, selector));

    expect(roundedElements(screen.container)).toEqual([]);
    for (const row of rows) {
      expect(boxesUnder(parentOf(row))).not.toContain(row);
    }
  });

  it("keeps a selected mail lifted, square", async () => {
    const screen = await render(
      <Direction name="agents">
        <MailRow from="Métallerie" subject="Facture" time="09:42" selected />
      </Direction>,
    );
    const row = part(screen.container, "[data-slot=mail-row]");

    expect(shadowOf(row).boxShadow).not.toBe("none");
    expect(roundedElements(screen.container)).toEqual([]);
  });

  it("keeps tinted rows as square bands", async () => {
    const screen = await render(
      <Direction name="agents">
        <JournalPanel journal={weekJournal} routines={[weekTask]} />
      </Direction>,
    );
    const approval = part(screen.container, "[data-week-approval]");

    expect(getComputedStyle(approval).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(approval).borderTopWidth).toBe("0px");
    expect(getComputedStyle(approval).borderTopLeftRadius).toBe("0px");
  });
});
