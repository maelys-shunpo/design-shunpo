import "../src/styles/globals.css";
import { siGmail, siShopify } from "simple-icons";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import type { OsView } from "../src/agents/os-model.ts";
import { OsViewPane } from "../src/agents/os-view.tsx";

const view: OsView = {
  area: "clients",
  label: "Clients",
  brief: "Les demandes du week-end sont traitées.",
  figures: [],
  journal: [
    { at: "07:50", tool: siShopify, text: "Relivraison déclenchée" },
    { at: "06:20", tool: siGmail, text: "Litige passé à Sarah, dossier résumé" },
  ],
};

const labels = { decide: "À vous de décider", decided: "Fait.", journal: "Ce que SHUNPO a fait" };

function lineOrders(container: HTMLElement): Array<{ text: string; live: string | undefined }> {
  return [...container.querySelectorAll<HTMLElement>("li[data-live]")].map((item) => ({
    text: item.textContent ?? "",
    live: item.dataset["live"],
  }));
}

describe("OsViewPane journal", () => {
  it("replays through a live surface, newest line entering last", async () => {
    const screen = await render(
      <OsViewPane view={view} decisions={[]} approved={[]} onApprove={() => {}} labels={labels} />,
    );

    const surface = screen.container.querySelector("[data-slot=live-surface]");
    expect(surface).not.toBeNull();

    /* Lines read newest first; their replay order must rise toward the newest, so it lands last. */
    const orders = lineOrders(screen.container);
    const newest = orders.find((line) => line.text.includes("Relivraison"));
    const older = orders.find((line) => line.text.includes("Litige"));
    expect(Number(newest?.live)).toBeGreaterThan(Number(older?.live));
  });
});
