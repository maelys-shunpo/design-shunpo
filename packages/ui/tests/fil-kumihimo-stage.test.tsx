import "../src/styles/globals.css";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { KumihimoStage } from "../src/motion/fil-kumihimo-stage.tsx";
import { LIVE_TIMEOUT } from "../stories/support/live-timeout.ts";
import { DESKTOP } from "./support/viewports.ts";

function posterUrl(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 100;
  return canvas.toDataURL();
}

function centreOf(element: Element): [x: number, y: number] {
  const box = element.getBoundingClientRect();
  return [box.left + box.width / 2, box.top + box.height / 2];
}

async function renderLiveStage() {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  const screen = await render(
    <KumihimoStage
      progress={{ value: 0 }}
      posterAspect={1.6}
      pauseLabel="Mettre en pause les fils"
      playLabel="Relancer les fils"
      poster={<img src={posterUrl()} alt="Des fils emmêlés" />}
    >
      <p>Démêlez votre quotidien.</p>
      <a href="#diagnostic">Réserver un diagnostic</a>
    </KumihimoStage>,
  );
  await expect
    .element(screen.getByRole("button", { name: "Mettre en pause les fils" }), LIVE_TIMEOUT)
    .toBeVisible();
  return screen;
}

describe("KumihimoStage layering", () => {
  it("paints the copy above the live threads", async () => {
    const screen = await renderLiveStage();
    const copy = screen.getByText("Démêlez votre quotidien.").element();
    const box = copy.getBoundingClientRect();
    /* The copy layer lets the pointer through: made hittable for the check, it must paint above the canvas. */
    copy.setAttribute("style", "pointer-events: auto");

    expect(document.elementFromPoint(box.left + 4, box.top + box.height / 2)).toBe(copy);
  });

  it("lets the pointer reach the copy's links and the threads elsewhere", async () => {
    const screen = await renderLiveStage();
    const link = screen.getByRole("link", { name: "Réserver un diagnostic" }).element();

    expect(document.elementFromPoint(...centreOf(link))).toBe(link);
    expect(document.elementFromPoint(DESKTOP.width - 200, DESKTOP.height / 2)?.tagName).toBe(
      "CANVAS",
    );
  });

  it("keeps the stage's pause control reachable", async () => {
    const screen = await renderLiveStage();
    const pause = screen.getByRole("button", { name: "Mettre en pause les fils" }).element();

    expect(document.elementFromPoint(...centreOf(pause))?.closest("button")).toBe(pause);
  });
});
