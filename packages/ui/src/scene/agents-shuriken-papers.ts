import {
  CanvasTexture,
  Color,
  type DataTexture,
  ExtrudeGeometry,
  type LineBasicMaterial,
  type MeshStandardMaterial,
  Shape,
  SRGBColorSpace,
  Vector3,
} from "three";

import type { Rgb } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { createCreases, createPaper, createPaperGrain } from "./origami-paper.ts";
import { colour } from "./origami-papers.ts";

/* A tool printed on its sheet: its name and its simple-icons path, drawn in a 24-unit box. */
export interface ShurikenMark {
  title: string;
  path: string;
}

/* Each sheet's face and the ink its mark is printed in, the white back every sheet shares, and the pebble. */
export interface SheetInks {
  face: Rgb;
  ink: Rgb;
}

export interface ShurikenPalette {
  sheets: readonly SheetInks[];
  back: Rgb;
  signal: Rgb;
}

export interface ShurikenPapers {
  grain: DataTexture;
  creases: LineBasicMaterial;
  backlight: { value: Vector3 };
  sheets: MeshStandardMaterial[];
  marks: CanvasTexture[];
  pebble: MeshStandardMaterial;
}

const PRINT = 512;
/* Where the mark sits on the sheet, in its own units (the point at y = 1, the centre of the sign at y = 0): down
   the coloured stripe the flaps leave open. */
const MARK = { y: 0.58, size: 0.16 } as const;

function css([red, green, blue]: Rgb): string {
  return `rgb(${String(red)} ${String(green)} ${String(blue)})`;
}

interface Print {
  mark: ShurikenMark;
  inks: SheetInks;
  /* The branch's heading on the finished sign: the logo is turned back by as much, so it reads upright there. */
  heading: number;
}

/* The sheet's face as one print: its colour and the tool's logo in the sheet's ink. The texture covers the
   sheet's square, x from -0.5 to 0.5 and y from 0 to 1. */
function printMark({ mark, inks, heading }: Print) {
  const canvas = document.createElement("canvas");
  canvas.width = PRINT;
  canvas.height = PRINT;
  const context = canvas.getContext("2d");
  if (context !== null) {
    context.fillStyle = css(inks.face);
    context.fillRect(0, 0, PRINT, PRINT);
    context.fillStyle = css(inks.ink);
    const size = MARK.size * PRINT;
    context.translate(PRINT / 2, (1 - MARK.y) * PRINT);
    /* A turn of the sheet counter-clockwise on the sign is undone clockwise on the canvas, whose y runs down. */
    context.rotate(heading);
    context.scale(size / 24, size / 24);
    context.translate(-12, -12);
    const logo = new Path2D(mark.path);
    // oxlint-disable-next-line unicorn/no-array-fill-with-reference-type -- a canvas fills a Path2D, this is no array.
    context.fill(logo);
  }
  return Object.assign(new CanvasTexture(canvas), { colorSpace: SRGBColorSpace, anisotropy: 8 });
}

const WHITE = new Color(1, 1, 1);
const PLAIN: SheetInks = { face: [255, 255, 255], ink: [30, 38, 41] };

export function createShurikenPapers(
  tier: QualityTier,
  palette: ShurikenPalette,
  { marks, headings }: { marks: readonly ShurikenMark[]; headings: readonly number[] },
): ShurikenPapers {
  const grain = createPaperGrain();
  const backlight = { value: new Vector3(0, 0, -1) };
  const back = colour(palette.back);
  const prints = marks.map((mark, index) =>
    printMark({
      mark,
      inks: palette.sheets[index % palette.sheets.length] ?? PLAIN,
      heading: headings[index] ?? 0,
    }),
  );
  /* The print carries the face's colour, so the paper itself is white in front. */
  const sheets = prints.map((print) =>
    Object.assign(createPaper({ front: WHITE, back, backlight }, grain, tier), { map: print }),
  );
  /* The top light lifts a flat card by about a quarter: the pebble is mixed darker so it reads as Fushimi. */
  const signal = colour(palette.signal).multiplyScalar(0.74);
  return {
    grain,
    creases: createCreases(),
    backlight,
    sheets,
    marks: prints,
    /* A dense card: no sheen, so the Fushimi stays deep under the top light. */
    pebble: Object.assign(createPaper({ front: signal, back: signal, backlight }, grain, tier), {
      sheen: 0,
      roughness: 0.92,
    }),
  };
}

export function disposeShurikenPapers(papers: ShurikenPapers): void {
  for (const material of [...papers.sheets, papers.pebble]) {
    material.dispose();
  }
  for (const print of papers.marks) {
    print.dispose();
  }
  papers.creases.dispose();
  papers.grain.dispose();
}

/* The SHUNPO pebble (`brand/shuriken-paths.ts`, PEBBLE), in the sign's units: its centre on the sign's centre, a
   point's reach (58.1 in the logo's box) as one unit, the logo's top toward the back of the floor. */
const LOGO_CENTRE = [77.19, 82.85] as const;
const LOGO_REACH = 58.1;

function point(x: number, y: number): [number, number] {
  return [(x - LOGO_CENTRE[0]) / LOGO_REACH, -(y - LOGO_CENTRE[1]) / LOGO_REACH];
}

export function pebbleShape(): Shape {
  const shape = new Shape();
  shape.moveTo(...point(77.19, 0));
  shape.bezierCurveTo(...point(29.72, 0), ...point(0, 31.83), ...point(0, 82.85));
  shape.bezierCurveTo(...point(0, 133.87), ...point(29.72, 165.59), ...point(77.19, 165.59));
  shape.bezierCurveTo(...point(124.66, 165.59), ...point(154.38, 133.76), ...point(154.38, 82.85));
  shape.bezierCurveTo(...point(154.38, 31.94), ...point(124.55, 0), ...point(77.19, 0));
  return shape;
}

/* A thick card, its edges barely softened, lying flat with its top face up. */
export function createPebbleGeometry(): ExtrudeGeometry {
  const geometry = new ExtrudeGeometry(pebbleShape(), {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 48,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, 0.01, 0);
  return geometry;
}
