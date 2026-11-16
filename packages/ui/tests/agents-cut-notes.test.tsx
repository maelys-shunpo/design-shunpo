import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { EmailDraft } from "../src/agents/email-draft.tsx";
import { ToastNote } from "../src/agents/toast-note.tsx";
import { Direction } from "../src/layout/direction.tsx";
import {
  atDesktop,
  cutOf,
  folded,
  part,
  roundedElements,
  shadowOf,
} from "./support/agents-corners.ts";

beforeEach(atDesktop);

describe("Notes", () => {
  it("folds a toast 12 px deep", async () => {
    const screen = await render(
      <Direction name="agents">
        <ToastNote app="Slack" message="Factures saisies" />
      </Direction>,
    );
    const toast = part(screen.container, "[data-slot=toast-note]");

    expect(cutOf(toast)).toBe("12px");
    expect(folded(toast)).toBe(true);
    expect(shadowOf(toast).filter).toContain("drop-shadow");
    expect(roundedElements(screen.container)).toEqual([]);
  });

  it("folds a draft and cuts its send button as an action", async () => {
    const screen = await render(
      <Direction name="agents">
        <EmailDraft to="Claire" subject="Relance" body="Bonjour" sendLabel="Envoyer" />
      </Direction>,
    );
    const draft = part(screen.container, "[data-slot=email-draft]");
    const send = screen.getByText("Envoyer").element();

    expect(cutOf(draft)).toBe("16px");
    expect(folded(draft)).toBe(true);
    expect(cutOf(send)).toBe("8px");
    expect(getComputedStyle(send).pointerEvents).toBe("none");
  });

  it("never moves the fold under the pointer", async () => {
    const screen = await render(
      <Direction name="agents">
        <ToastNote app="Slack" message="Factures saisies" />
      </Direction>,
    );
    const toast = part(screen.container, "[data-slot=toast-note]");

    expect(getComputedStyle(toast, "::after").transitionProperty).not.toContain("--agents-cut");
  });
});
