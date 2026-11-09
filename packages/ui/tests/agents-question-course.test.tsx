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

/* The same stage with the scene's travelling frame. */
function framedStage() {
  return (
    <div data-testid="stage" className="relative h-svh w-full">
      <QuestionNight question={<h2>Question ?</h2>} plates={plates} />
      <div className="absolute inset-0 grid place-items-center">
        <StatementLines paragraphs={[["Une ligne", "une autre."], ["La dernière."]]} />
      </div>
      <span data-question-frame="" className="agents-frame-travel" />
    </div>
  );
}

/* A length the course wrote, in pixels. */
function pixels(value: string | undefined): number {
  return Number((value ?? "").replace("px", ""));
}

/* The frame's box as the course set it, in the stage's coordinates (its own box is still on its way). */
function frameBox(container: HTMLElement) {
  const frame = container.querySelector<HTMLElement>("[data-question-frame]");
  const [x, y] = (frame?.style.translate ?? "").split(" ");
  return {
    x: pixels(x),
    y: pixels(y),
    width: pixels(frame?.style.width),
    height: pixels(frame?.style.height),
  };
}

/* A box in the stage's coordinates. */
function inStage(container: HTMLElement, rect: DOMRect | undefined) {
  const stageBox = container.querySelector("[data-testid=stage]")?.getBoundingClientRect();
  return {
    x: Number(rect?.left) - Number(stageBox?.left),
    y: Number(rect?.top) - Number(stageBox?.top),
    width: Number(rect?.width),
    height: Number(rect?.height),
  };
}

/* The box of an element's words: the union of its text's own boxes. */
function wordsOf(target: Element | null): DOMRect {
  const walker = document.createTreeWalker(target ?? document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      [left, top] = [Math.min(left, rect.left), Math.min(top, rect.top)];
      [right, bottom] = [Math.max(right, rect.right), Math.max(bottom, rect.bottom)];
    }
  }
  return new DOMRect(left, top, right - left, bottom - top);
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

  it("designates each plate with one frame, lets go during the cut, then brackets the line that lands", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(framedStage());
    const frame = screen.container.querySelector<HTMLElement>("[data-question-frame]");
    const paint = questionCourse(screen.container);
    /* The course starts its question half a screen into the hold. */
    function at(screens: number): void {
      paint?.(0.5 + screens);
    }

    at(0.1);
    expect(frame?.dataset["shown"]).toBeUndefined();

    at(0.3);
    const second = inStage(
      screen.container,
      screen.container.querySelectorAll("[data-question-plate]")[1]?.getBoundingClientRect(),
    );
    expect(frame?.dataset["shown"]).toBe("");
    /* Kome on the night: Fushimi never sits on Fuji Night. */
    expect(frame?.dataset["tone"]).toBe("night");
    expect(frameBox(screen.container).x).toBeCloseTo(second.x - 8, 0);
    expect(frameBox(screen.container).y).toBeCloseTo(second.y - 8, 0);

    at(0.45);
    expect(screen.container.querySelectorAll("[data-question-ghost]")).toHaveLength(3);

    at(0.9);
    expect(frame?.dataset["shown"]).toBeUndefined();

    at(2);
    const landing = inStage(
      screen.container,
      wordsOf(screen.container.querySelector("[data-statement-paragraph]:last-of-type")),
    );
    expect(frame?.dataset["tone"]).toBe("paper");
    /* Large brackets as tall as the phrase, standing off its words on their sides. */
    expect(frame?.dataset["shape"]).toBe("bracket");
    expect(frameBox(screen.container).y).toBeCloseTo(landing.y, 0);
    expect(frameBox(screen.container).height).toBeCloseTo(landing.height, 0);
    expect(frameBox(screen.container).x).toBeCloseTo(landing.x - 20, 0);
  });

  it("sets the line that lands in the same weight as the others", async () => {
    const screen = await render(stage());
    const [first, last] = [...screen.container.querySelectorAll("[data-statement-paragraph]")].map(
      (paragraph) => getComputedStyle(paragraph).fontWeight,
    );

    expect(last).toBe(first);
  });
});
