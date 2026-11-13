import "../src/styles/globals.css";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import { Headline } from "../src/agents/headline.tsx";
import { QuestionScene } from "../src/agents/question-scene.tsx";
import { holdIdleCallbacks } from "./support/idle-callbacks.ts";
import { pause, SETTLE_MS } from "./support/pause.ts";
import { allowMotion, preferReducedMotion } from "./support/reduced-motion.ts";
import { DESKTOP, PHONE } from "./support/viewports.ts";

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
  { icon: "time", title: "Temps", text: "Un devis, une facture." },
  { icon: "departure", title: "Mémoire", text: "Un départ, des congés." },
  { icon: "hidden", title: "Pilotage", text: "Trop tard." },
  { icon: "restart", title: "Contexte", text: "Tout recoller." },
] as const;

function scene() {
  return (
    <QuestionScene
      question={<h2>Vos outils ne suivent plus ?</h2>}
      plates={plates}
      answer={[["Vos outils devraient", "vous faire gagner du temps."], ["Pas en perdre."]]}
      answerKeyword="perdre"
      answerLevel="h3"
    />
  );
}

/* Each plate's icon: hidden from assistive technology, its stroke, and whether it leads the plate. */
function plateIcons(container: HTMLElement) {
  return [...container.querySelectorAll("[data-slot=night-plate]")].map((plate) => {
    const icon = plate.querySelector("svg[data-slot=icon]");
    return {
      hidden: icon?.getAttribute("aria-hidden"),
      stroke: icon === null ? "" : getComputedStyle(icon).strokeWidth,
      first: plate.firstElementChild === icon,
    };
  });
}

/* The night's clip, empty while nothing has painted it. */
function clipOf(container: HTMLElement) {
  return container.querySelector<HTMLElement>("[data-question-night]")?.style.clipPath ?? "";
}

/* The type an element is set in. */
function typeOf(element: Element | null) {
  const { fontFamily, fontWeight, fontSize, letterSpacing } = getComputedStyle(
    element ?? document.body,
  );
  return { fontFamily, fontWeight, fontSize, letterSpacing };
}

/* The scene as the page sets it: the page's question and pains, at their real lengths. */
function realScene() {
  return (
    <QuestionScene
      question={
        <Headline level={2} size="title" align="center">
          Votre entreprise grandit et vos outils ne suivent plus ?
        </Headline>
      }
      plates={[
        {
          icon: "time",
          title: "Vous perdez du temps",
          text: "Un devis dans un outil, la facture dans un autre, et la bonne information à chercher entre mails, WhatsApp et Drive.",
        },
        {
          icon: "departure",
          title: "La mémoire part avec les gens",
          text: "Un départ, des congés, un changement de poste : le contexte d’un client s’en va avec celui qui le portait.",
        },
        {
          icon: "hidden",
          title: "Vous pilotez à l’aveugle",
          text: "Quand vous voyez un problème, il a déjà coûté.",
        },
        {
          icon: "restart",
          title: "Chaque IA repart de zéro",
          text: "ChatGPT ou Claude ne connaissent ni vos clients ni vos projets. Vos équipes recollent le contexte à la main, à chaque question.",
        },
      ]}
      answer={[
        ["Vos outils devraient", "vous faire gagner du temps."],
        ["Pas vous en faire perdre."],
      ]}
      answerKeyword="perdre"
      answerLevel="h3"
    />
  );
}

/* The size a plate's sentence is seen at once the course has fitted the night to the screen. */
async function seenPlateTextPx(container: HTMLElement): Promise<number> {
  const content = container.querySelector<HTMLElement>("[data-question-content]");
  await expect.poll(() => content?.style.scale ?? "").not.toBe("");
  const text = container.querySelector("[data-slot=night-plate] p");
  const size = Number(getComputedStyle(text ?? document.body).fontSize.replace("px", ""));
  return size * Number(content?.style.scale);
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

  it("sets the answer in the type of a section title, its keyword between ink brackets", async () => {
    const screen = await render(
      <>
        {scene()}
        <Headline level={2} size="title" data-testid="title">
          Titre
        </Headline>
      </>,
    );
    const answer = screen.container.querySelector("[data-slot=statement-lines]");
    const title = screen.container.querySelector("[data-testid=title]");
    const word = answer?.querySelector("[data-slot=ink-word]");

    expect(word?.textContent).toBe("perdre");
    expect(word?.querySelectorAll("[data-ink-bracket]")).toHaveLength(2);
    expect(word?.closest("[data-statement-paragraph]")?.textContent).toBe("Pas en perdre.");
    expect(typeOf(answer)).toEqual(typeOf(title));
  });

  it("gives the four plates the same width, in one row under the question, on a wide screen", async () => {
    await page.viewport(1440, 900);
    const screen = await render(realScene());
    const widths = [...screen.container.querySelectorAll("[data-question-plate]")].map((plate) =>
      Math.round(plate.getBoundingClientRect().width),
    );

    expect(new Set(widths).size).toBe(1);
  });

  it("keeps the plates' sentences at 13 px or more once the night is fitted to a phone", async () => {
    await page.viewport(PHONE.width, PHONE.height);
    const screen = await render(realScene());
    releaseIdleCallbacks();

    expect(await seenPlateTextPx(screen.container)).toBeGreaterThanOrEqual(13);
  });

  it("marks each plate with a hairline icon above its title, hidden from assistive technology", async () => {
    const screen = await render(scene());

    expect(plateIcons(screen.container)).toEqual(
      Array.from({ length: 4 }, () => ({ hidden: "true", stroke: "1px", first: true })),
    );
  });

  it("sets each plate straight on the night, with no surface of its own", async () => {
    const screen = await render(scene());
    const surfaces = [...screen.container.querySelectorAll("[data-slot=night-plate]")].map(
      (plate) => getComputedStyle(plate).backgroundColor,
    );

    expect(surfaces).toEqual(Array.from({ length: 4 }, () => "rgba(0, 0, 0, 0)"));
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
