/* The held wheel's own paper (`data-wheel-paper`, internal to `MethodWheel`), on a sheet that shows its grain
   (`CoverSheet paper="washi"`). While the stage is held the sheet scrolls on under it, and its grain would slide under
   the folded paper and its shadow: the held paper covers the stage instead, in the sheet's grain, and moves only as
   the ink rises, so the stroke stays painted on it and the objects stand still on it. It starts in phase with the
   sheet as the stage is caught, and drifts while only the question stands on it, by about what the page scrolls
   meanwhile plus what brings it back in phase with the sheet when the wheel lets it go: the stage leaves no seam. */

interface DriftFrame {
  /* Pixels the page scrolls while the stage is held: the track less the stage. */
  stuck: number;
  /* Pixels the hold's timeline spans: the track less the window. */
  timeline: number;
  /* The hold, and where the question's time ends in it, in screens. */
  hold: number;
  questionEnd: number;
  /* How far the ink has risen when the wheel lets go (negative: up). */
  riseEnd: number;
  /* The grain's tile height. */
  tile: number;
}

/* Wraps a length into half a tile either side of zero. */
function nearest(value: number, tile: number): number {
  const wrapped = (((value % tile) + tile) % tile) - tile;
  return wrapped < -tile / 2 ? wrapped + tile : wrapped;
}

/* How far the held paper drifts while only the question stands on it: about as far as the page scrolls meanwhile
   (including the scroll between the stage being caught and the timeline setting off), plus what makes its final place
   a whole number of tiles from the sheet's. */
export function questionDrift({
  stuck,
  timeline,
  hold,
  questionEnd,
  riseEnd,
  tile,
}: DriftFrame): number {
  const scrolled = stuck - timeline + (timeline * questionEnd) / hold;
  return scrolled + nearest(stuck + riseEnd - scrolled, tile);
}

interface ShiftFrame {
  /* Where the hold is, in screens. */
  held: number;
  /* How far the ink has risen at that point (negative: up). */
  rise: number;
  drift: number;
  questionEnd: number;
}

/* The held paper's shift from where it stood as the stage was caught, at a point of the hold (negative: up). */
export function paperShift({ held, rise, drift, questionEnd }: ShiftFrame): number {
  const share = Math.min(1, Math.max(0, held / questionEnd));
  return -drift * share + rise;
}

interface PaperPlan {
  layer: HTMLElement;
  /* The sheet's grain at the layer as the stage is caught, in background-position terms. */
  x: number;
  y: number;
  tile: number;
  drift: number;
}

interface PaperSetting {
  hold: number;
  questionEnd: number;
  riseEnd: number;
}

interface PaperParts {
  layer: HTMLElement;
  stage: HTMLElement;
  track: HTMLElement;
  sheet: HTMLElement;
}

function paperParts(root: HTMLElement): PaperParts | undefined {
  const layer = root.querySelector<HTMLElement>("[data-wheel-paper]");
  const track = root.closest<HTMLElement>("[data-slot=scroll-scene]");
  const sheet = root.closest<HTMLElement>("[data-slot=cover-sheet]");
  const stage = track?.firstElementChild;
  if (layer === null || track === null || sheet === null || !(stage instanceof HTMLElement)) {
    return undefined;
  }
  return { layer, stage, track, sheet };
}

/* The grain's tile height on the held paper, or none when the sheet shows no grain or the stage is not held. */
function grainTile(layer: HTMLElement): number | undefined {
  const style = getComputedStyle(layer);
  const tile = Number(style.backgroundSize.split(" ")[1]?.replace(/px$/u, ""));
  if (style.backgroundImage === "none" || style.display === "none" || !(tile > 0)) {
    return undefined;
  }
  return tile;
}

/* Measures the held paper against the sheet it lies on. None when the sheet shows no grain, or the stage is not held
   (phones, reduced motion). */
export function planPaper(root: HTMLElement, setting: PaperSetting): PaperPlan | undefined {
  const parts = paperParts(root);
  const tile = parts === undefined ? undefined : grainTile(parts.layer);
  if (parts === undefined || tile === undefined) {
    return undefined;
  }
  const { layer, stage, track, sheet } = parts;
  const sheetBox = sheet.getBoundingClientRect();
  const trackBox = track.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  const layerBox = layer.getBoundingClientRect();
  return {
    layer,
    x: sheetBox.left - layerBox.left,
    /* Caught, the stage's top is the track's; the layer keeps its place in the stage. */
    y: sheetBox.top - trackBox.top - (layerBox.top - stageBox.top),
    tile,
    drift: questionDrift({
      stuck: track.offsetHeight - stage.offsetHeight,
      timeline: track.offsetHeight - window.innerHeight,
      tile,
      ...setting,
    }),
  };
}

/* Lays the held paper where it is at a point of the hold. */
export function paintPaper(
  plan: PaperPlan,
  { held, rise, questionEnd }: { held: number; rise: number; questionEnd: number },
): void {
  const y = plan.y + paperShift({ held, rise, drift: plan.drift, questionEnd });
  plan.layer.style.setProperty("--wheel-paper-x", `${String(plan.x % plan.tile)}px`);
  plan.layer.style.setProperty("--wheel-paper-y", `${String(y % plan.tile)}px`);
}
