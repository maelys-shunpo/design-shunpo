/* Where each routine lands in the agent's journal, measured once when the scene's timeline is built (the page is
   idle, at rest, nothing transformed yet): the scrub then only plays numbers, it never reads the layout. */
export interface Landing {
  x: number;
  y: number;
  /* One scale for both axes, to the journal line's height: the band that travels keeps its proportions. */
  scale: number;
  /* How far the journal has scrolled up when this line lands, so the newest line stays in view. */
  shift: number;
}

export interface WeekMeasure {
  /* The sweep's travel: the width of the five days. */
  sweep: number;
  landings: Map<string, Landing>;
}

function boxOf(root: HTMLElement, selector: string): DOMRect | undefined {
  return root.querySelector(selector)?.getBoundingClientRect();
}

/* The journal's visible area; the journal scrolls once a line would land below it. */
function journalView(root: HTMLElement): { top: number; bottom: number } {
  const view = root.querySelector("[data-week-log]")?.parentElement?.getBoundingClientRect();
  return { top: view?.top ?? 0, bottom: view?.bottom ?? Number.POSITIVE_INFINITY };
}

/* The journal scrolls by whole lines: the smallest line top, from the list's own top, that clears what is needed. */
function wholeLines(tops: readonly number[], needed: number): number {
  return tops.find((top) => top >= needed) ?? needed;
}

export function measureWeek(root: HTMLElement | null, ids: readonly string[]): WeekMeasure {
  const landings = new Map<string, Landing>();
  if (root === null) {
    return { sweep: 0, landings };
  }
  const view = journalView(root);
  const tops: number[] = [];
  let shift = 0;
  for (const id of ids) {
    const from = boxOf(root, `[data-week-task='${id}']`);
    const to = boxOf(root, `[data-week-row='${id}']`);
    if (from === undefined || to === undefined || from.height === 0) {
      continue;
    }
    tops.push(to.top - view.top);
    shift = Math.max(shift, wholeLines(tops, to.bottom - view.bottom));
    landings.set(id, {
      x: to.left - from.left,
      y: to.top - shift - from.top,
      scale: to.height / from.height,
      shift,
    });
  }
  const days = root.querySelector<HTMLElement>("[data-week-sweep-line]")?.parentElement;
  return { sweep: days?.offsetWidth ?? 0, landings };
}
