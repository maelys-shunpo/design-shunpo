import { inkImage } from "../lib/brush-ink.ts";
import { paintBrushStroke } from "../lib/brush-stroke.ts";
import { wheelCourse, wheelGeometry } from "../lib/wheel-geometry.ts";
import { stepPitch, tipDistance, type WheelTrail, wheelTrail } from "../lib/wheel-trail.ts";
import { sceneLength } from "../motion/tokens.ts";
import { paintSlides, paintSteps } from "./method-wheel-slides.ts";
import { paintPaper, planPaper } from "./wheel-paper.ts";
import { releaseSizes, watchSizes } from "./wheel-sizes.ts";

/* Screens the wheel is held under the floating nav (`ScrollScene length="long"`). */
export const WHEEL_HOLD = sceneLength.long;
/* The question holds alone for a quarter screen, then rises and fades over 0.4 screen; the ink stroke sets off a tenth
   of a screen into it, so the stroke is what opens the wheel (the home page's timing). */
const QUESTION_HOLD_SCREENS = 0.25;
const LEAVE_SCREENS = 0.4;
const STROKE_AFTER_SCREENS = 0.1;
const QUESTION_RISE_PX = 48;
/* Where the stroke sets off, in screens of the hold: until then only the question stands on the paper. */
const STROKE_SETS_OFF = QUESTION_HOLD_SCREENS + STROKE_AFTER_SCREENS;
/* The last phase holds complete, every deliverable ticked, before the section scrolls on. */
const TAIL_SCREENS = 0.25;
/* Pixels between the resting drop and the copy, less on a narrow screen. */
const DOT_GAP_PX = 100;
const DOT_GAP_SHARE = 0.55;
/* One sumi brush stroke, one load of ink: down the arc to the first drop, then on down past the last. */
const BRUSH_WIDTH = 18;
const BRUSH_SEED = 108;
/* A phase's deliverables tick through the first third of its time on screen: they are all ticked while its paper
   rests, before the next morph begins (the first phase's time includes the stroke coming down). */
const TICK_SHARE = 0.35;
const SAMPLES = 2000;
/* A drop lands once the tip is this close to its centre: well inside its rim. */
const DROP_REACH_PX = 8;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/* The question's exit at a point of the hold, in screens: it accelerates away (power2.in) as it rises and fades. */
export function questionLeave(held: number): { opacity: number; rise: number } {
  const eased = clamp((held - QUESTION_HOLD_SCREENS) / LEAVE_SCREENS) ** 3;
  return { opacity: 1 - eased, rise: -QUESTION_RISE_PX * eased };
}

/* The wheel's course (0 to 1) at a point of the hold: it starts as the question starts to leave and ends before the
   tail. */
export function wheelProgress(held: number): number {
  return clamp((held - STROKE_SETS_OFF) / (WHEEL_HOLD - STROKE_SETS_OFF - TAIL_SCREENS));
}

/* Where each phase is named along the course (0 to 1): the first once its dot has landed, each next one as its dot
   lands. Sampled from `wheelCourse`, so the ticks follow the wheel exactly. */
export function phaseStarts(phases: number): number[] {
  const starts: number[] = [];
  for (let sample = 0; sample <= SAMPLES && starts.length < phases; sample += 1) {
    const progress = sample / SAMPLES;
    while (starts.length < phases && wheelCourse(progress, phases).active >= starts.length) {
      starts.push(progress);
    }
  }
  return starts;
}

/* How many of a phase's deliverables are ticked at a point of the course: none as it is named, all of them a third
   of the way to the next phase (or to the end of the course for the last one). */
interface Ticking {
  progress: number;
  starts: readonly number[];
  phase: number;
  deliverables: number;
}

export function tickedAt({ progress, starts, phase, deliverables }: Ticking): number {
  const start = starts[phase] ?? 1;
  const end = starts[phase + 1] ?? 1;
  const share = clamp((progress - start) / Math.max(end - start, Number.EPSILON));
  return Math.min(deliverables, Math.floor((share / TICK_SHARE) * (deliverables + 1)));
}

interface Parts {
  root: HTMLElement;
  title: HTMLElement | null;
  brush: SVGPathElement;
  ink: SVGImageElement;
  dots: HTMLElement[];
  steps: HTMLElement[];
  copy: HTMLElement;
}

function partsOf(root: HTMLElement): Parts | undefined {
  const brush = root.querySelector("[data-wheel-brush]");
  const ink = root.querySelector("[data-wheel-ink]");
  const copy = root.querySelector<HTMLElement>("[data-wheel-copy]");
  if (!(brush instanceof SVGPathElement) || !(ink instanceof SVGImageElement) || copy === null) {
    return undefined;
  }
  return {
    root,
    title: root.querySelector<HTMLElement>("[data-wheel-title]"),
    brush,
    ink,
    dots: [...root.querySelectorAll<HTMLElement>("[data-wheel-dot]")],
    steps: [...root.querySelectorAll<HTMLElement>("[data-slot=wheel-step]")],
    copy,
  };
}

interface Measures {
  width: number;
  height: number;
  /* The tallest phase's copy: the pitch is measured on it. */
  copyBlock: number;
  trail: WheelTrail;
  /* The distance between two phases: the ink, the drops and the copy rise by one a phase. */
  pitch: number;
  /* Along the reveal path (`stroke.centre`): its lead before the trail's first point, and its whole length. */
  reveal: { before: number; total: number };
}

/* Paints the stroke once for the stage, along the whole trail: the brush lands with a press on the arc, runs wet down
   to the first drop and on, then its hairs split dry toward the last. The raster is shifted to hold what lies above and
   left of the stage, and reaches below it as far as the trail goes. Returns where the trail lies along the reveal path. */
function paintInk({ brush, ink }: Parts, trail: WheelTrail): Measures["reveal"] {
  const margin = BRUSH_WIDTH * 2;
  const left = Math.max(0, margin - Math.min(...trail.points.map(([x]) => x)));
  const above = Math.max(0, margin - Math.min(...trail.points.map(([, y]) => y)));
  const stroke = paintBrushStroke({
    points: trail.points.map(([x, y]) => [x + left, y + above] as const),
    width: BRUSH_WIDTH,
    seed: BRUSH_SEED,
  });
  const width = Math.max(...trail.points.map(([x]) => x)) + left + margin;
  const height = Math.max(...trail.points.map(([, y]) => y)) + above + margin;
  ink.setAttribute("href", inkImage([stroke], { width, height }));
  for (const [name, value] of Object.entries({ x: -left, y: -above, width, height })) {
    ink.setAttribute(name, String(value));
  }
  brush.setAttribute("d", stroke.centre);
  brush.setAttribute("transform", `translate(${String(-left)} ${String(-above)})`);
  brush.setAttribute("stroke-width", String(stroke.revealWidth));
  /* The masks and the painted rect cover the raster, however far below the stage the trail runs. */
  const reach = stroke.revealWidth;
  const box = {
    x: -left - reach,
    y: -above - reach,
    width: width + 2 * reach,
    height: height + 2 * reach,
  };
  for (const cover of brush.ownerSVGElement?.querySelectorAll("mask, rect") ?? []) {
    for (const [name, value] of Object.entries(box)) {
      cover.setAttribute(name, String(value));
    }
  }
  const [firstX = 0, firstY = 0] = trail.points[0] ?? [];
  const lead = brush.getPointAtLength(0);
  return {
    before: Math.hypot(lead.x - left - firstX, lead.y - above - firstY),
    total: brush.getTotalLength(),
  };
}

/* Measures the stage and paints the stroke once for its size: the brush lands with a press, runs wet, then its hairs
   split dry as it reaches the drop. */
/* Every phase's copy gets the height of the tallest one, so each starts at the same line and the title holds still
   from phase to phase, whatever the length of its text (`agents-wheel-copy`). */
function evenCopies({ root, steps }: Parts): number {
  const tallest = Math.max(
    0,
    ...steps.map((step) => step.querySelector<HTMLElement>("[data-wheel-copy]")?.offsetHeight ?? 0),
  );
  root.style.setProperty("--wheel-copy-block", `${String(tallest)}px`);
  return tallest;
}

function measure(parts: Parts): Measures {
  const { root, copy, steps } = parts;
  const tallest = evenCopies(parts);
  const [width, height] = [root.clientWidth, root.clientHeight];
  const copyLeft = copy.getBoundingClientRect().left - root.getBoundingClientRect().left;
  const geometry = wheelGeometry({
    height,
    dotX: copyLeft - Math.min(DOT_GAP_PX, copyLeft * DOT_GAP_SHARE),
  });
  const pitch = stepPitch(tallest, height);
  const trail = wheelTrail(geometry, { phases: steps.length, pitch });
  const reveal = paintInk(parts, trail);
  return { width, height, copyBlock: tallest, trail, pitch, reveal };
}

interface TrailFrame {
  brush: SVGPathElement;
  dots: readonly HTMLElement[];
  measures: Measures;
  course: { entry: number; travel: number; active: number };
}

/* The brush paints down to its tip; the page follows the tip, so the ink and its drops rise a pitch a phase. A drop
   lands as the tip reaches it and stays on the ink. Returns how far the ink has risen (negative: up). */
function paintTrail({ brush, dots, measures, course }: TrailFrame): number {
  const { trail, pitch, reveal } = measures;
  const tip = tipDistance(trail, course.entry, course.travel);
  const painted = course.entry > 0 ? (reveal.before + tip) / reveal.total : 0;
  brush.setAttribute("stroke-dashoffset", String(1 - painted));
  const rise = -course.travel * pitch;
  brush.ownerSVGElement?.style.setProperty("translate", `0 ${String(rise)}px`);
  const landed = trail.marks.map((mark) => tip >= mark - DROP_REACH_PX);
  /* The current drop is the last one the brush has reached: the phase may be named a moment before its own lands. */
  const current = landed.lastIndexOf(true);
  for (const [index, dot] of dots.entries()) {
    const drop = trail.drops[index] ?? { x: 0, y: 0 };
    dot.style.setProperty("translate", `${String(drop.x)}px ${String(drop.y + rise)}px`);
    dot.toggleAttribute("data-landed", landed[index] === true);
    dot.toggleAttribute("data-active", index === current);
    dot.toggleAttribute("data-passed", index < current);
  }
  return rise;
}

/* The held paper against the sheet, for the stage's size: the ink has risen a pitch a phase when the wheel lets go. */
function paperFor(root: HTMLElement, { pitch }: Measures, phases: number) {
  const riseEnd = -wheelCourse(wheelProgress(WHEEL_HOLD), phases).travel * pitch;
  return planPaper(root, { hold: WHEEL_HOLD, questionEnd: STROKE_SETS_OFF, riseEnd });
}

/* The wheel's course over the hold, in screens: the question alone, then it rises and fades while the ink stroke comes
   down the arc; when its drop lands the first phase is named, then the stroke runs on down the page and the scroll
   carries the ink, its drops and the phases up by a pitch a phase, and ticks each phase's deliverables. Returns the
   painter for a point of the hold; it measures again whenever the stage changes size or a copy outgrows the tallest.
   `onCourse` hears the wheel's travel (0 on the first drop, 1 on the second…) and the phase named, for the phases'
   film. */
export function methodWheelCourse(
  root: HTMLElement,
  onCourse?: (course: { travel: number; active: number }) => void,
): ((held: number) => void) | undefined {
  const parts = partsOf(root);
  if (parts === undefined) {
    return undefined;
  }
  const { title, brush, dots, steps } = parts;
  const starts = phaseStarts(steps.length);
  let measures = measure(parts);
  let paper = paperFor(root, measures, steps.length);
  /* A copy that grows past the tallest (text set in a late font, a longer line) changes the pitch, not the stage: the
     next paint measures again. */
  const stale = watchSizes(parts, () => measures.copyBlock);
  const wheelParts: Parts = parts;
  function refresh() {
    if (
      stale.copy ||
      root.clientWidth !== measures.width ||
      root.clientHeight !== measures.height
    ) {
      stale.copy = false;
      measures = measure(wheelParts);
      stale.paper = true;
    }
    if (stale.paper) {
      stale.paper = false;
      paper = paperFor(root, measures, steps.length);
    }
  }
  return (held: number) => {
    refresh();
    const leave = questionLeave(held);
    title?.style.setProperty("--wheel-title-opacity", String(leave.opacity));
    title?.style.setProperty("--wheel-title-rise", `${String(leave.rise)}px`);

    const progress = wheelProgress(held);
    const course = wheelCourse(progress, steps.length);
    onCourse?.({ travel: course.travel, active: course.active });
    const rise = paintTrail({ brush, dots, measures, course });
    if (paper !== undefined) {
      paintPaper(paper, { held, rise, questionEnd: STROKE_SETS_OFF });
    }
    paintSlides({ steps, pitch: measures.pitch, travel: course.travel, entry: course.entry });
    const deliverables =
      steps[course.active]?.querySelectorAll("[data-wheel-deliverable]").length ?? 0;
    paintSteps(
      steps,
      course.active,
      tickedAt({ progress, starts, phase: course.active, deliverables }),
    );
  };
}

/* Leaves the phases as phones and reduced motion read them: no phase current, every deliverable ticked. */
export function settleWheel(root: HTMLElement): void {
  releaseSizes(root);
  for (const step of root.querySelectorAll<HTMLElement>("[data-slot=wheel-step]")) {
    delete step.dataset["wheelActive"];
    step.style.removeProperty("--wheel-shift");
    step.style.removeProperty("--wheel-presence");
    step.querySelector("[data-wheel-copy]")?.removeAttribute("aria-current");
  }
  root.querySelector<SVGElement>("[data-slot=wheel-ink]")?.style.removeProperty("translate");
  for (const deliverable of root.querySelectorAll<HTMLElement>("[data-wheel-deliverable]")) {
    delete deliverable.dataset["pending"];
  }
}
