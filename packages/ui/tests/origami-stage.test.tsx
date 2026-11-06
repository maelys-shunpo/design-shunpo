import "../src/styles/globals.css";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { OrigamiJourney } from "../src/motion/origami-journey.tsx";
import { OrigamiStage } from "../src/motion/origami-stage.tsx";
import { LIVE_TIMEOUT } from "../stories/support/live-timeout.ts";
import { DESKTOP } from "./support/viewports.ts";

describe("OrigamiStage and OrigamiJourney", () => {
  it("holds the stage behind the chapters and names its pause control in French", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(
      <div data-direction="origami">
        <OrigamiJourney
          choreography={vi.fn<(timeline: gsap.core.Timeline) => void>()}
          stage={
            <OrigamiStage
              progress={{ value: 0 }}
              poster={
                <img alt="Une feuille à plat" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
              }
            />
          }
        >
          <p>Premier chapitre</p>
        </OrigamiJourney>
      </div>,
    );

    await expect.element(screen.getByText("Premier chapitre")).toBeVisible();
    await expect
      .element(screen.getByRole("img", { name: "Une feuille à plat" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: "Mettre l’animation en pause" }), LIVE_TIMEOUT)
      .toBeVisible();
  });
});
