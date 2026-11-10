import { Headline } from "../../src/agents/headline.tsx";
import { MethodWheel } from "../../src/agents/method-wheel.tsx";
import { Direction } from "../../src/layout/direction.tsx";
import { pause, SETTLE_MS } from "./pause.ts";

/* The method wheel as the tests read it: three phases, the scroll held at a share of the wheel, and what it paints. */

const phases = [
  {
    id: "immersion",
    label: "5 jours auprès de vos équipes",
    title: "Immersion",
    text: "On suit votre équipe.",
    deliverables: ["Carte des processus", "Heures perdues estimées", "Feuille de route"],
    kanji: "見",
    panel: <p>Carte du flux</p>,
  },
  {
    id: "construction",
    label: "Brique par brique",
    title: "Construction",
    text: "On construit un premier flux.",
    deliverables: ["Interface de suivi", "Outils connectés"],
    kanji: "築",
    panel: <p>Flux factures</p>,
  },
  {
    id: "evolution",
    label: "Après la mise en service",
    title: "Évolution",
    text: "On suit les usages.",
    deliverables: ["Suivi des usages"],
    kanji: "進",
    panel: <p>Flux en production</p>,
  },
] as const;

export function wheel(film?: Parameters<typeof MethodWheel>[0]["film"]) {
  return (
    <Direction name="agents">
      <MethodWheel
        title={<Headline level={2}>Chaque projet commence par une Immersion</Headline>}
        phases={phases}
        film={film}
      />
    </Direction>
  );
}

/* Scrolls the page to a share of the wheel's hold. */
export async function holdAt(share: number) {
  const track = document.querySelector<HTMLElement>("[data-slot=scroll-scene]");
  const top = (track?.getBoundingClientRect().top ?? 0) + window.scrollY;
  const length = (track?.offsetHeight ?? 0) - window.innerHeight;
  window.scrollTo(0, top + length * share);
  await pause(SETTLE_MS * 3);
}

export function inkOf(container: HTMLElement) {
  return container.querySelector("[data-wheel-ink]")?.getAttribute("href") ?? "";
}

export function currentOf(container: HTMLElement) {
  return container.querySelector("[data-wheel-active] h3")?.textContent ?? "";
}

/* How far the ink layer has risen (negative: up), in px. */
export function inkShift(container: HTMLElement): number {
  const ink = container.querySelector<SVGElement>("[data-slot=wheel-ink]");
  return Number((ink?.style.translate.split(" ")[1] ?? "0").replace("px", ""));
}

export function dotsOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>("[data-wheel-dot]")];
}

/* Where a drop sits in the stage, from its `translate`. */
export function dotY(dot: HTMLElement | undefined): number {
  return Number((dot?.style.translate.split(" ")[1] ?? "NaN").replace("px", ""));
}

/* The drop's ink inside a marker: its rendered height and its opacity. */
export function dropLook(dot: HTMLElement | undefined): { height: number; opacity: string } {
  const drop = dot?.firstElementChild;
  if (!(drop instanceof HTMLElement)) {
    return { height: 0, opacity: "" };
  }
  return { height: drop.getBoundingClientRect().height, opacity: getComputedStyle(drop).opacity };
}

export function landedOf(container: HTMLElement): boolean[] {
  return dotsOf(container).map((dot) => Object.hasOwn(dot.dataset, "landed"));
}

export function revealOf(container: HTMLElement): number {
  return Number(
    container.querySelector("[data-wheel-brush]")?.getAttribute("stroke-dashoffset") ?? "NaN",
  );
}

/* The resting drop's height in the stage: the wheel's centre (`wheelGeometry`, 0.505 of the stage). */
export function restY(container: HTMLElement): number {
  return (
    (container.querySelector<HTMLElement>("[data-slot=method-wheel]")?.clientHeight ?? 0) * 0.505
  );
}

/* Each phase's slide as the course sets it: how far below its rest (px) and how present. */
export function slidesOf(container: HTMLElement): Array<{ shift: number; presence: number }> {
  return [...container.querySelectorAll<HTMLElement>("[data-slot=wheel-step]")].map((step) => ({
    shift: Number(step.style.getPropertyValue("--wheel-shift").replace("px", "")),
    presence: Number(step.style.getPropertyValue("--wheel-presence")),
  }));
}

/* How far down the ink can paint: the lowest edge shared by its reveal mask, its ink mask and its painted rect. */
export function paintedBottom(container: HTMLElement): number {
  const boxes = [
    ...container.querySelectorAll<SVGMaskElement | SVGRectElement>(
      "[data-slot=wheel-ink] mask, [data-slot=wheel-ink] rect",
    ),
  ];
  return Math.min(...boxes.map((box) => box.y.baseVal.value + box.height.baseVal.value));
}

/* Where the painted stroke's raster ends, in the ink's own space. */
export function inkBottom(container: HTMLElement): number {
  const ink = container.querySelector("[data-wheel-ink]");
  return Number(ink?.getAttribute("y") ?? "NaN") + Number(ink?.getAttribute("height") ?? "NaN");
}

/* Makes one phase's text long enough to outgrow the stage's share. */
export function lengthenCopy(container: HTMLElement, phase: number): void {
  const text = container.querySelectorAll("[data-wheel-copy] p")[phase];
  text?.replaceChildren(
    "On suit les usages, on ajuste les seuils et on ajoute des flux. ".repeat(30),
  );
}

/* Counts the observers watching the phases' copies, live: observing and not yet disconnected. */
export function watchCopyObservers(): { live: () => number; restore: () => void } {
  const Original = globalThis.ResizeObserver;
  const watching = new Set<ResizeObserver>();
  globalThis.ResizeObserver = class extends Original {
    override observe(target: Element, options?: ResizeObserverOptions): void {
      if (target.matches("[data-wheel-copy]")) {
        watching.add(this);
      }
      super.observe(target, options);
    }

    override disconnect(): void {
      watching.delete(this);
      super.disconnect();
    }
  };
  return {
    live: () => watching.size,
    restore: () => {
      globalThis.ResizeObserver = Original;
    },
  };
}
