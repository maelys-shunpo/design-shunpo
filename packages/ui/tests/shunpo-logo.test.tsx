import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { ProposalCard } from "../src/brand/proposal-card.tsx";
import { ShunpoLogo } from "../src/brand/shunpo-logo.tsx";

describe("ShunpoLogo", () => {
  it("draws the wordmark and its seal, named for assistive technology", async () => {
    const screen = await render(<ShunpoLogo label="SHUNPO, accueil" />);

    await expect.element(screen.getByText("SHUNPO, accueil")).toBeInTheDocument();
    expect(screen.container.querySelectorAll("path[data-part='seal']").length).toBeGreaterThan(0);
  });
});

describe("ProposalCard", () => {
  it.each(["instant", "mecanique", "fil"] as const)(
    "links to the %s proposal with its emblem",
    async (direction) => {
      const screen = await render(
        <ProposalCard
          direction={direction}
          href={`#${direction}`}
          index="01"
          name={direction}
          tagline="Une ligne"
          technique="Technique"
          action="Voir"
        />,
      );

      await expect
        .element(screen.getByRole("link", { name: new RegExp(direction, "u") }))
        .toHaveAttribute("href", `#${direction}`);
      expect(screen.container.querySelector("[data-slot='proposal-visual']")).not.toBeNull();
    },
  );
});
