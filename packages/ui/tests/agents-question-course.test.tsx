import "../src/styles/globals.css";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { questionCourse } from "../src/agents/question-course.ts";
import { QuestionNight } from "../src/agents/question-night.tsx";
import { StatementLines } from "../src/agents/statement-lines.tsx";
import { DESKTOP, PHONE } from "./support/viewports.ts";

afterEach(async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
});

const plates = [
  { number: "01", title: "Un", text: "Premier." },
  { number: "02", title: "Deux", text: "Deuxième." },
  { number: "03", title: "Trois", text: "Troisième." },
  { number: "04", title: "Quatre", text: "Quatrième." },
] as const;

/* A stage as the scene draws it with motion: the night over the answer, both filling it. */
function stage() {
  return (
    <div data-testid="stage" className="relative h-svh w-full">
      <QuestionNight question={<h2>Question ?</h2>} plates={plates} />
      <div className="absolute inset-0 grid place-items-center">
        <StatementLines paragraphs={[["Une ligne", "une autre."], ["La dernière."]]} />
      </div>
    </div>
  );
}

function styleOf(container: HTMLElement, selector: string) {
  return container.querySelector<HTMLElement>(selector)?.style;
}

describe("questionCourse", () => {
  it("has nothing to paint without a night", async () => {
    const screen = await render(<div />);
    expect(questionCourse(screen.container)).toBeUndefined();
  });

  it("opens a card, brings the plates in, cuts the night away and raises the answer line by line", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(stage());
    const paint = questionCourse(screen.container);
    paint?.(0);
    expect(styleOf(screen.container, "[data-question-night]")?.clipPath).toContain("path(");
    expect(styleOf(screen.container, "[data-question-plate]")?.opacity).toBe("0");
    paint?.(1);
    expect(styleOf(screen.container, "[data-question-plate]")?.opacity).toBe("1");
    paint?.(3);
    expect(styleOf(screen.container, "[data-question-night]")?.clipPath).toBe("inset(50%)");
    expect(styleOf(screen.container, "[data-statement-line]")?.translate).toBe("0px 0%");
  });

  it("raises whole paragraphs on phones, and measures again when the stage resizes", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(stage());
    const paint = questionCourse(screen.container);
    paint?.(0);
    expect(styleOf(screen.container, "[data-statement-paragraph]")?.opacity).toBe("0");
    await page.viewport(DESKTOP.width, DESKTOP.height);
    paint?.(3);
    expect(styleOf(screen.container, "[data-statement-line]")?.translate).toBe("0px 0%");
  });
});
