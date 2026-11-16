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
  { icon: "time", title: "Un", text: "Premier." },
  { icon: "departure", title: "Deux", text: "Deuxième." },
  { icon: "hidden", title: "Trois", text: "Troisième." },
  { icon: "restart", title: "Quatre", text: "Quatrième." },
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

/* The same stage with the scene's travelling frame and a keyword in the answer's last line. */
function framedStage() {
  return (
    <div data-testid="stage" className="relative h-svh w-full">
      <QuestionNight question={<h2>Question ?</h2>} plates={plates} />
      <div className="absolute inset-0 grid place-items-center">
        <StatementLines
          paragraphs={[["Une ligne", "une autre."], ["La dernière."]]}
          keyword="dernière"
        />
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

/* What the course painted on the keyword: its blur, its brackets' opacity and which way each stands off its place
   (-1 to the left, 1 to the right, 0 home). */
function inkOf(container: HTMLElement) {
  const [start, end] = container.querySelectorAll<HTMLElement>("[data-ink-bracket]");
  return {
    blur: styleOf(container, "[data-ink-text]")?.filter,
    opacity: start?.style.opacity,
    start: Math.sign(pixels(start?.style.translate)),
    end: Math.sign(pixels(end?.style.translate)),
  };
}

/* The vertical middle of a box. */
function middle(rect: DOMRect | undefined) {
  return Number(rect?.top) + Number(rect?.height) / 2;
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
    paint?.(3.4);
    expect(styleOf(screen.container, "[data-question-night]")?.clipPath).toBe("inset(50%)");
    expect(styleOf(screen.container, "[data-statement-line]")?.translate).toBe("0px 0%");
  });

  it("fills the screen at once and starts the course with no card when the night arrives full-screen", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(stage());
    const paint = questionCourse(screen.container, 0);
    paint?.(0);
    /* The night already covers the screen: its clip opens from the top-left corner, with no card inset. */
    expect(styleOf(screen.container, "[data-question-night]")?.clipPath).toContain("M 0 0 ");
    /* The course runs from the first screen: the first plate is on its way before a quarter screen, where the card
       arrival would still be holding the night's entrance. */
    paint?.(0.2);
    expect(Number(styleOf(screen.container, "[data-question-plate]")?.opacity)).toBeGreaterThan(0);
  });

  it("holds the question alone in the middle of the night, then raises it to the top with the plates under it", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(stage());
    const paint = questionCourse(screen.container);
    const night = screen.container.querySelector("[data-question-night]")?.getBoundingClientRect();
    function question() {
      return screen.container.querySelector("[data-question-text]")?.getBoundingClientRect();
    }

    paint?.(0.4);
    expect(middle(question())).toBeCloseTo(middle(night), 0);
    expect(styleOf(screen.container, "[data-question-plate]")?.opacity).toBe("0");

    /* All four plates have settled (the last lands 1.2 screens into the course). */
    paint?.(0.4 + 1.3);
    const plateTops = [...screen.container.querySelectorAll("[data-question-plate]")].map((plate) =>
      Math.round(plate.getBoundingClientRect().top),
    );
    expect(middle(question())).toBeLessThan(middle(night) - 100);
    expect(new Set(plateTops).size).toBe(1);
    expect(plateTops[0]).toBeGreaterThan(Number(question()?.bottom));
  });

  it("dims the question with the plates before the shuriken lands on it, so the star never bites a lit headline", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(stage());
    const paint = questionCourse(screen.container);

    paint?.(0.4 + 1.1);
    expect(styleOf(screen.container, "[data-question-text]")?.opacity).toBe("1");
    /* The shuriken holds on its mark about 2.31 screens into the course (0.35 of the way through the cut). */
    paint?.(0.4 + 2.31);
    expect(Number(styleOf(screen.container, "[data-question-text]")?.opacity)).toBeLessThan(0.5);
  });

  it("keeps each answer line unseen under its mask until it starts to rise, so no glyph peeks out during the cut", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(stage());
    const paint = questionCourse(screen.container);

    paint?.(0.4 + 1.5);
    expect(styleOf(screen.container, "[data-statement-line]")?.opacity).toBe("0");
    paint?.(0.5 + 3);
    expect(styleOf(screen.container, "[data-statement-line]")?.opacity).toBe("1");
  });

  it("raises whole paragraphs on phones, and measures again when the stage resizes", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(stage());
    const paint = questionCourse(screen.container);
    paint?.(0);
    expect(styleOf(screen.container, "[data-statement-paragraph]")?.opacity).toBe("0");
    await page.viewport(DESKTOP.width, DESKTOP.height);
    paint?.(3.4);
    expect(styleOf(screen.container, "[data-statement-line]")?.translate).toBe("0px 0%");
  });

  it("designates each plate with one frame and lets go for good during the cut", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(framedStage());
    const frame = screen.container.querySelector<HTMLElement>("[data-question-frame]");
    const paint = questionCourse(screen.container);
    /* The course starts its question four tenths of a screen into the hold. */
    function at(screens: number): void {
      paint?.(0.4 + screens);
    }

    at(0.2);
    expect(frame?.dataset["shown"]).toBeUndefined();

    /* The frame has reached the second plate (designated from 0.55 screens into the course). */
    at(0.7);
    const second = inStage(
      screen.container,
      screen.container.querySelectorAll("[data-question-plate]")[1]?.getBoundingClientRect(),
    );
    expect(frame?.dataset["shown"]).toBe("");
    /* Kome on the night: Fushimi never sits on Fuji Night. */
    expect(frame?.dataset["tone"]).toBe("night");
    expect(frameBox(screen.container).x).toBeCloseTo(second.x - 8, 0);
    expect(frameBox(screen.container).y).toBeCloseTo(second.y - 8, 0);

    /* The frame has jumped on to the third plate, leaving one trail of three ghosts. */
    at(0.9);
    expect(screen.container.querySelectorAll("[data-question-ghost]")).toHaveLength(3);

    /* It lets go for good once the last plate has landed (the release is 1.39 screens in). */
    at(1.4);
    expect(frame?.dataset["shown"]).toBeUndefined();

    at(2);
    expect(frame?.dataset["shown"]).toBeUndefined();
  });

  it("brings the keyword into focus as its line lands, then closes its brackets on it from outside", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(framedStage());
    const paint = questionCourse(screen.container);

    paint?.(0.4 + 1.5);
    expect(inkOf(screen.container)).toEqual({
      blur: "blur(14px)",
      opacity: "0",
      start: -1,
      end: 1,
    });

    paint?.(0.5 + 3);
    expect(inkOf(screen.container)).toEqual({
      blur: "blur(0px)",
      opacity: "1",
      start: 0,
      end: 0,
    });
  });

  it("shows the keyword faint and blurred as its line rises, so the line never reads with a hole in it", async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    const screen = await render(framedStage());
    const paint = questionCourse(screen.container);

    /* The last line has started to rise (2.78 screens into the course), the keyword not yet in focus (2.86). */
    paint?.(0.4 + 2.8);
    expect(Number(styleOf(screen.container, "[data-ink-text]")?.opacity)).toBeGreaterThan(0.2);
    expect(styleOf(screen.container, "[data-ink-text]")?.filter).toBe("blur(14px)");
  });

  it("sets the line that lands in the same weight as the others", async () => {
    const screen = await render(stage());
    const [first, last] = [...screen.container.querySelectorAll("[data-statement-paragraph]")].map(
      (paragraph) => getComputedStyle(paragraph).fontWeight,
    );

    expect(last).toBe(first);
  });
});
