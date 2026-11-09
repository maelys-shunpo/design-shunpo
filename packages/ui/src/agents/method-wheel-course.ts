import { inkImage } from "../lib/brush-ink.ts";
import { paintBrushStroke } from "../lib/brush-stroke.ts";
import {
  arcPoints,
  entryAngle,
  type WheelGeometry,
  wheelCourse,
  wheelGeometry,
  wheelPoint,
} from "../lib/wheel-geometry.ts";
import { sceneLength } from "../motion/tokens.ts";

/* Screens the wheel is held under the floating nav (`ScrollScene length="long"`). */
export const WHEEL_HOLD = sceneLength.long;
/* The question holds alone for a quarter screen, then rises and fades over 0.4 screen; the ink stroke sets off a tenth
   of a screen into it, so the stroke is what opens the wheel (the home page's timing). */
const QUESTION_HOLD_SCREENS = 0.25;
const LEAVE_SCREENS = 0.4;
const STROKE_AFTER_SCREENS = 0.1;
const QUESTION_RISE_PX = 48;
/* The last phase holds complete, every deliverable ticked, before the section scrolls on. */
const TAIL_SCREENS = 0.25;
/* Degrees between two phases on the wheel; pixels between the resting dot and the copy, less on a narrow screen. */
const STEP_DEGREES = 24;
const DOT_GAP_PX = 100;
const DOT_GAP_SHARE = 0.55;
/* One sumi brush stroke from where the arc enters the screen down to the first dot. */
const BRUSH_WIDTH = 18;
const BRUSH_SEED = 108;
/* A phase's deliverables tick through the first three quarters of its time on screen. */
const TICK_SHARE = 0.75;
const SAMPLES = 2000;

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
  const start = QUESTION_HOLD_SCREENS + STROKE_AFTER_SCREENS;
  return clamp((held - start) / (WHEEL_HOLD - start - TAIL_SCREENS));
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

/* How many of a phase's deliverables are ticked at a point of the course: none as it is named, all of them three
   quarters of the way to the next phase (or to the end of the course for the last one). */
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
  geometry: WheelGeometry;
}

/* Measures the stage and paints the stroke once for its size: the brush lands with a press, runs wet, then its hairs
   split dry as it reaches the drop. */
function measure({ root, copy, brush, ink }: Parts): Measures {
  const [width, height] = [root.clientWidth, root.clientHeight];
  const copyLeft = copy.getBoundingClientRect().left - root.getBoundingClientRect().left;
  const geometry = wheelGeometry({
    height,
    dotX: copyLeft - Math.min(DOT_GAP_PX, copyLeft * DOT_GAP_SHARE),
  });
  const stroke = paintBrushStroke({
    points: arcPoints(geometry, entryAngle(geometry), 0),
    width: BRUSH_WIDTH,
    seed: BRUSH_SEED,
  });
  ink.setAttribute("href", inkImage([stroke], { width, height }));
  ink.setAttribute("width", String(width));
  ink.setAttribute("height", String(height));
  brush.setAttribute("d", stroke.centre);
  brush.setAttribute("stroke-width", String(stroke.revealWidth));
  return { width, height, geometry };
}

/* The current phase carries `data-wheel-active` (its lines, kanji and board come in) and `aria-current` on its copy
   (the two-corner frame designates it); its deliverables not yet ticked carry `data-pending`. */
function paintSteps(steps: readonly HTMLElement[], active: number, ticked: number): void {
  for (const [index, step] of steps.entries()) {
    const current = index === active;
    step.toggleAttribute("data-wheel-active", current);
    const copy = step.querySelector("[data-wheel-copy]");
    if (current) {
      copy?.setAttribute("aria-current", "step");
    } else {
      copy?.removeAttribute("aria-current");
    }
    if (current) {
      for (const [row, deliverable] of step
        .querySelectorAll("[data-wheel-deliverable]")
        .entries()) {
        deliverable.toggleAttribute("data-pending", row >= ticked);
      }
    }
  }
}

/* The wheel's course over the hold, in screens: the question alone, then it rises and fades while the ink stroke comes
   down the arc; when its drop falls the first phase is named, then the scroll moves the dots from phase to phase and
   ticks each phase's deliverables. Returns the painter for a point of the hold; it measures again whenever the stage
   changes size. */
export function methodWheelCourse(root: HTMLElement): ((held: number) => void) | undefined {
  const parts = partsOf(root);
  if (parts === undefined) {
    return undefined;
  }
  const { title, brush, dots, steps } = parts;
  const starts = phaseStarts(steps.length);
  let measures = measure(parts);
  return (held: number) => {
    if (root.clientWidth !== measures.width || root.clientHeight !== measures.height) {
      measures = measure(parts);
    }
    const leave = questionLeave(held);
    title?.style.setProperty("--wheel-title-opacity", String(leave.opacity));
    title?.style.setProperty("--wheel-title-rise", `${String(leave.rise)}px`);

    const progress = wheelProgress(held);
    const course = wheelCourse(progress, steps.length);
    brush.setAttribute("stroke-dashoffset", String(1 - course.entry));
    const top = entryAngle(measures.geometry);
    const turn = top * (1 - course.entry) + course.travel * STEP_DEGREES;
    for (const [index, dot] of dots.entries()) {
      const point = wheelPoint(measures.geometry, turn - index * STEP_DEGREES);
      dot.style.setProperty("translate", `${String(point.x)}px ${String(point.y)}px`);
      dot.toggleAttribute("data-active", index === course.active);
      dot.toggleAttribute("data-passed", index < course.active);
    }
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
  for (const step of root.querySelectorAll<HTMLElement>("[data-slot=wheel-step]")) {
    delete step.dataset["wheelActive"];
    step.querySelector("[data-wheel-copy]")?.removeAttribute("aria-current");
  }
  for (const deliverable of root.querySelectorAll<HTMLElement>("[data-wheel-deliverable]")) {
    delete deliverable.dataset["pending"];
  }
}
