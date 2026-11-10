/* The method wheel's phases as pages (internal to `methodWheelCourse`): each copy and kanji slides up with the ink,
   one pitch a phase, fading away from its rest; the current one is named and ticks its deliverables. */

/* Share of a step within which a phase's copy is seen: wide enough that the leaving copy and the coming one cross, so
   there is always something to read. */
const PRESENCE_SHARE = 0.85;
/* Immersion's copy comes up this far from below as its drop lands. */
const ENTRY_RISE_PX = 96;
/* How far the stroke has come down when Immersion's copy starts to come in. */
const LANDING_FROM = 0.8;

interface Slides {
  steps: readonly HTMLElement[];
  /* The distance between two phases: each copy sits a pitch below the one before it. */
  pitch: number;
  /* Phases travelled since the first one (`wheelCourse`). */
  travel: number;
  /* How far the stroke has come down: the first phase comes in only as its drop lands. */
  entry: number;
}

/* Where a phase's copy stands: how far below its rest and how present. */
function slideOf(
  index: number,
  { pitch, travel, entry }: Omit<Slides, "steps">,
): { shift: number; presence: number } {
  if (entry < 1) {
    const landed = Math.min(1, Math.max(0, (entry - LANDING_FROM) / (1 - LANDING_FROM)));
    return { shift: (1 - landed) * ENTRY_RISE_PX, presence: index === 0 ? landed : 0 };
  }
  const distance = index - travel;
  const away = Math.min(1, Math.abs(distance) / PRESENCE_SHARE);
  return { shift: distance * pitch, presence: 1 - away * away * (3 - 2 * away) };
}

/* Every phase's copy and kanji slide like a page, up with the ink as the scroll goes on: the current one rises and
   fades as the next comes up from below and fades in (`--wheel-shift`, `--wheel-presence`). Immersion comes up a short
   way from below as its drop lands. */
export function paintSlides({ steps, ...course }: Slides): void {
  for (const [index, step] of steps.entries()) {
    const { shift, presence } = slideOf(index, course);
    step.style.setProperty("--wheel-shift", `${String(shift)}px`);
    step.style.setProperty("--wheel-presence", String(presence));
  }
}

/* How many of a phase's deliverables show ticked: all of a passed phase, the current one's so far, none of a phase
   still to come, even as it slides into view. */
function rowsTicked(index: number, active: number, ticked: number): number {
  if (index < active) {
    return Number.POSITIVE_INFINITY;
  }
  return index === active ? ticked : 0;
}

/* The current phase carries `data-wheel-active` (its lines, kanji and board come in) and `aria-current` on its copy
   (the two-corner frame designates it); its deliverables not yet ticked carry `data-pending`. */
export function paintSteps(steps: readonly HTMLElement[], active: number, ticked: number): void {
  for (const [index, step] of steps.entries()) {
    const current = index === active;
    step.toggleAttribute("data-wheel-active", current);
    const copy = step.querySelector("[data-wheel-copy]");
    if (current) {
      copy?.setAttribute("aria-current", "step");
    } else {
      copy?.removeAttribute("aria-current");
    }
    const done = rowsTicked(index, active, ticked);
    for (const [row, deliverable] of step.querySelectorAll("[data-wheel-deliverable]").entries()) {
      deliverable.toggleAttribute("data-pending", row >= done);
    }
  }
}
