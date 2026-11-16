import { ease } from "../motion/tokens.ts";

/* Shares of the scene (0 to 1). The windows take off as the copy leaves, one leading at a time; the workspace forms
   just before the first lands; each row fills once its window has melted into its logo tile; the statuses turn
   while the last windows land, and the closing line settles over them. */
const COPY_EXIT = { at: 0, span: 0.06 };
const WORKSPACE_FORM = { at: 0.1, span: 0.12 };
const FLIGHT = { at: 0.04, span: 0.22, gap: 0.07 };
/* The last part of a flight, over which the window melts into its row's logo tile. */
const LANDING = 0.1;
const FILL = 0.06;
/* A status turns no earlier than this, and never before its row has filled. */
const STATUS = { at: 0.55, span: 0.035, gap: 0.03, afterFill: 0.02 };
const CAPTION = { at: 0.62, span: 0.1 };
/* How far the copy rises as it leaves, and the workspace as it forms, in pixels. */
const COPY_RISE = -56;
const WORKSPACE_RISE = 32;
const WORKSPACE_FROM_SCALE = 0.94;
/* The size a window shrinks to as it lands: a share of its row's logo tile. */
const LANDED_HEIGHT = 1.5;

interface Flight {
  card: HTMLElement;
  row: HTMLElement;
  x: number;
  y: number;
  scale: number;
}

function centreOf(element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/* Measured before any tween is built: the workspace and the windows are still where the page painted them. */
function measureFlights(scene: HTMLElement): Flight[] {
  const flights: Flight[] = [];
  for (const row of scene.querySelectorAll<HTMLElement>("[data-converge-row]")) {
    const card = scene.querySelector<HTMLElement>(
      `[data-converge-glimpse='${row.dataset["convergeRow"] ?? ""}']`,
    );
    if (card === null || card.offsetWidth === 0) {
      continue;
    }
    /* The window docks on the row's logo tile, clear of the words of the rows already filled. */
    const tile = row.querySelector<HTMLElement>("[data-converge-tile]") ?? row;
    const from = centreOf(card);
    const to = centreOf(tile);
    flights.push({
      card,
      row,
      x: to.x - from.x,
      y: to.y - from.y,
      scale: (tile.offsetHeight * LANDED_HEIGHT) / card.offsetHeight,
    });
  }
  return flights;
}

function flyIn(timeline: gsap.core.Timeline, flight: Flight, start: number): void {
  const land = start + FLIGHT.span - LANDING;
  /* x and y on different eases draw an arc: the window first slides along its margin, clear of the copy, then
     swings in to its row. */
  timeline
    .to(flight.card, { y: flight.y, duration: FLIGHT.span, ease: ease.standard }, start)
    .to(flight.card, { x: flight.x, duration: FLIGHT.span, ease: ease.inOut }, start)
    .to(
      flight.card,
      { rotation: 0, scale: flight.scale, duration: FLIGHT.span, ease: ease.inOut },
      start,
    )
    .to(flight.card, { opacity: 0, duration: LANDING, ease: ease.exit }, land);
}

/* When the row of a given rank has filled: its window's flight is over. */
function filledAt(index: number): number {
  return FLIGHT.at + index * FLIGHT.gap + FLIGHT.span + FILL;
}

/* The rows wait as empty slots (an empty logo tile, a hairline); each fills once its window has melted into it. */
function fillRows(timeline: gsap.core.Timeline, rows: HTMLElement[]): void {
  for (const [index, row] of rows.entries()) {
    timeline.fromTo(
      row.querySelectorAll("[data-converge-fill]"),
      { opacity: 0 },
      { opacity: 1, duration: FILL, ease: ease.standard, immediateRender: true },
      filledAt(index) - FILL,
    );
  }
}

function turnStatuses(timeline: gsap.core.Timeline, scene: HTMLElement): void {
  const working = [...scene.querySelectorAll("[data-converge-status='working']")];
  const final = [...scene.querySelectorAll("[data-converge-status='final']")];
  timeline.set(working, { opacity: 1 }, 0).set(final, { opacity: 0 }, 0);
  for (const [index, pill] of working.entries()) {
    const at = Math.max(STATUS.at + index * STATUS.gap, filledAt(index) + STATUS.afterFill);
    timeline
      .to(pill, { opacity: 0, duration: STATUS.span, ease: ease.exit }, at)
      .to(final[index] ?? [], { opacity: 1, duration: STATUS.span, ease: ease.standard }, at);
  }
}

function part(scene: HTMLElement, name: string): Element[] {
  return [...scene.querySelectorAll(`[data-converge='${name}']`)];
}

/* The promise gives way to the product: every scattered tool window flies into its own row of one workspace. */
export function convergeChoreography(timeline: gsap.core.Timeline, scene: HTMLElement): void {
  const flights = measureFlights(scene);
  const rows = [...scene.querySelectorAll<HTMLElement>("[data-converge-row]")];

  timeline
    .to(
      part(scene, "copy"),
      { y: COPY_RISE, opacity: 0, duration: COPY_EXIT.span, ease: ease.exit },
      COPY_EXIT.at,
    )
    .fromTo(
      part(scene, "workspace"),
      { opacity: 0, y: WORKSPACE_RISE, scale: WORKSPACE_FROM_SCALE },
      { opacity: 1, y: 0, scale: 1, duration: WORKSPACE_FORM.span, ease: ease.standard },
      WORKSPACE_FORM.at,
    );
  for (const flight of flights) {
    flyIn(timeline, flight, FLIGHT.at + rows.indexOf(flight.row) * FLIGHT.gap);
  }
  fillRows(timeline, rows);
  turnStatuses(timeline, scene);
  timeline
    .fromTo(
      part(scene, "caption"),
      { opacity: 0, y: WORKSPACE_RISE / 2 },
      { opacity: 1, y: 0, duration: CAPTION.span, ease: ease.standard },
      CAPTION.at,
    )
    /* The scene ends on the gathered workspace, held. */
    .set({}, {}, 1);
}
