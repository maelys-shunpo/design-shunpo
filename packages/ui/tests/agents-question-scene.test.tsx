import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { QuestionScene } from "../src/agents/question-scene.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP } from "./support/viewports.ts";

let releaseIdleCallbacks: () => void;

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  releaseIdleCallbacks = holdIdleCallbacks();
});

afterEach(async () => {
  window.scrollTo(0, 0);
  await allowMotion();
});

const plates = [
  { title: "Ressaisies", text: "Un devis, une facture." },
  { title: "Recherches", text: "Mails, Drive." },
  { title: "Absences", text: "Tout ralentit." },
  { title: "Pilotage", text: "Trop tard." },
] as const;

function scene() {
  return (
    <QuestionScene
      question={<h2>Vos outils ne suivent plus ?</h2>}
      plates={plates}
      answer={[["Vos outils devraient", "vous faire gagner du temps."], ["Pas en perdre."]]}
      answerLevel="h3"
    />
  );
}

/* The night's clip, empty while nothing has painted it. */
function clipOf(container: HTMLElement) {
  return container.querySelector<HTMLElement>("[data-question-night]")?.style.clipPath ?? "";
}

describe("QuestionScene", () => {
  it("asks the question with its four plates and answers it one level below", async () => {
    const screen = await render(scene());
    await expect
      .element(screen.getByRole("heading", { level: 2, name: "Vos outils ne suivent plus ?" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("heading", { level: 3, name: /gagner du temps\. Pas en perdre/u }))
      .toBeInTheDocument();
    expect(screen.container.querySelectorAll("[data-slot=night-plate]")).toHaveLength(4);
  });

  it("opens the night as a card around the question once the page is idle", async () => {
    const screen = await render(scene());
    releaseIdleCallbacks();
    await expect.poll(() => clipOf(screen.container), { timeout: 5000 }).toContain("path(");
  });

  it("leaves the night whole above the answer under reduced motion", async () => {
    await preferReducedMotion();
    const screen = await render(scene());
    releaseIdleCallbacks();
    await pause(SETTLE_MS);
    expect(clipOf(screen.container)).toBe("");
  });
});
