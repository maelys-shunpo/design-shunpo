import { CoverSheet } from "../../src/agents/cover-sheet.tsx";
import { HeroFilm } from "../../src/agents/hero-film.tsx";
import { Direction } from "../../src/layout/direction.tsx";
import mp4 from "../../stories/support/rising-sun.mp4?url";
import webm from "../../stories/support/rising-sun.webm?url";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

export const TITLE = "On construit le système qui fait tourner votre entreprise, boosté à l’IA.";
export const CUES = { leaveAt: 0.75 } as const;

/* The hero at the head of a page, the rest of the page rising over it as one sheet three windows high. */
export function HeroFilmPage() {
  return (
    <Direction name="agents">
      <main>
        <HeroFilm
          sources={{ mp4, webm }}
          poster={<img src={PIXEL} alt="Le soleil se lève sur les montagnes" />}
          still={<img src={PIXEL} alt="Le soleil levé" />}
          title={TITLE}
          action={<a href="#contact">Réserver une Immersion</a>}
          {...CUES}
        />
        <CoverSheet>
          <div style={{ height: "300vh" }} />
        </CoverSheet>
      </main>
    </Direction>
  );
}

export function filmPart(container: HTMLElement, name: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-hero-film='${name}']`);
  if (element === null) {
    throw new Error(`No ${name} in the hero film`);
  }
  return element;
}

export function shown(element: Element): boolean {
  const style = getComputedStyle(element);
  return style.visibility === "visible" && style.display !== "none" && Number(style.opacity) > 0;
}
