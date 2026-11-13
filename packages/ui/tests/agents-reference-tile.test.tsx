import "../src/styles/globals.css";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { ReferenceTile } from "../src/agents/reference-tile.tsx";
import { DESKTOP } from "./support/viewports.ts";

beforeEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

describe("ReferenceTile", () => {
  it("sets the name like a wordmark, or reads it behind a logo", async () => {
    const screen = await render(
      <>
        <ReferenceTile name="TF1" detail="Application de jeu" />
        <ReferenceTile name="Altaroc" logo={<svg viewBox="0 0 10 10" />} />
      </>,
    );
    await expect.element(screen.getByText("TF1")).toBeVisible();
    await expect.element(screen.getByText("Application de jeu")).toBeVisible();
    await expect.element(screen.getByText("Altaroc")).toBeInTheDocument();
  });
});
