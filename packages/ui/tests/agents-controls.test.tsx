import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { AgentsAction } from "../src/agents/action.tsx";
import { TextField } from "../src/agents/text-field.tsx";

describe("AgentsAction", () => {
  it("adds an arrow, hidden from assistive technology, only when asked", async () => {
    const screen = await render(
      <>
        <AgentsAction href="#a" arrow>
          Avec flèche
        </AgentsAction>
        <AgentsAction href="#b">Sans flèche</AgentsAction>
      </>,
    );

    await expect.element(screen.getByRole("link", { name: "Avec flèche" })).toBeVisible();
    const [withArrow, without] = screen.container.querySelectorAll("a");
    expect(withArrow?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(without?.querySelector("svg")).toBeNull();
  });
});

describe("TextField", () => {
  it("names its input for screen readers", async () => {
    const screen = await render(<TextField label="Tâche" placeholder="Ex." />);

    await expect.element(screen.getByRole("textbox", { name: "Tâche" })).toBeVisible();
  });
});
