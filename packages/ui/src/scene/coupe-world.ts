// prettier-ignore
import {
  type BufferGeometry, type CanvasTexture, Color, DoubleSide, Float32BufferAttribute, FrontSide,
  Group, Mesh, MeshBasicMaterial, PlaneGeometry, Shape, ShapeGeometry, SRGBColorSpace, Vector2,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

import { STAR } from "../brand/shuriken-paths.ts";
import { type Rgb, resolveColor } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { GHOST_COUNT } from "../motion/coupe-geometry.ts";
import { drawPaper, sheetTexture } from "./coupe-sheet.ts";

/* The sheet covers this half-width and half-height in world units: wide enough that the camera's eight-unit-tall
   frame is filled at any aspect the held stage takes, so the halves never need rebuilding. */
const COVER_X = 12;
const COVER_Y = 6;
/* The visible height the camera frames, used to throw each half clear of the screen as the page gives. */
export const SCREEN_HEIGHT = 8;

/* Where the questions' sheet lands on a half's 24 × 12 world-unit UVs so it covers the frame once, cropped to fit and
   centred, never stretched and never tiled, as a poster's `background-size: cover` would. The frame is `SCREEN_HEIGHT`
   tall and `SCREEN_HEIGHT × frameAspect` wide; the sheet keeps its own `sheetAspect`. Returned as the texture's repeat
   and offset over the half's UVs (0 at a half's far corner, 1 at the opposite one). */
export function sheetFraming(
  frameAspect: number,
  sheetAspect: number,
): { repeat: Vector2; offset: Vector2 } {
  const cover = Math.max((SCREEN_HEIGHT * frameAspect) / sheetAspect, SCREEN_HEIGHT);
  const repeatX = (COVER_X * 2) / (cover * sheetAspect);
  const repeatY = (COVER_Y * 2) / cover;
  return {
    repeat: new Vector2(repeatX, repeatY),
    offset: new Vector2(0.5 * (1 - repeatX), 0.5 * (1 - repeatY)),
  };
}

/* The blade's line: across the whole page, through the middle, falling gently to the right. */
const CUT_CENTER = new Vector2(0, -0.35);
const CUT_DIRECTION = new Vector2(1, -0.3).normalize();
const CUT_NORMAL = new Vector2(-CUT_DIRECTION.y, CUT_DIRECTION.x);

/* The star is drawn in the brand path's 154.38 × 165.59 box: its centre, and the scale that brings it to about one
   world unit across, the Y flipped because the path is in screen coordinates. */
const STAR_CENTER_X = 77.19;
const STAR_CENTER_Y = 82.85;
const STAR_TO_WORLD = 1 / 57;

interface Resource {
  dispose: () => void;
}

export interface CoupeHalf {
  group: Group;
  /* 1 for the upper half, -1 for the lower: which way it slides and falls. */
  side: 1 | -1;
  front: MeshBasicMaterial;
}

export interface CoupeCut {
  center: Vector2;
  direction: Vector2;
  normal: Vector2;
}

export interface CoupeWorld {
  root: Group;
  halves: readonly CoupeHalf[];
  slit: Mesh<BufferGeometry, MeshBasicMaterial>;
  star: Group;
  ghosts: readonly Group[];
  cut: CoupeCut;
  /* The printed face (the questions' sheet) and the washi back, laid once over the frame; the aspect they keep so the
     pose can re-frame them as the window's aspect changes. */
  paper: CanvasTexture;
  washi: CanvasTexture;
  sheetAspect: number;
  resources: readonly Resource[];
}

/* The token resolves to an sRGB triple; tell three it is sRGB so the renderer's output encoding does not lighten it
   (the paper textures are already tagged `SRGBColorSpace`; a bare `new Color(r, g, b)` would be read as linear). */
function toColor([red, green, blue]: Rgb): Color {
  return new Color().setRGB(red / 255, green / 255, blue / 255, SRGBColorSpace);
}

/* A seeded hash so the cut's tiny irregularities are the same every build: a blade through paper, not a ruler. */
function jitter(index: number): number {
  return Math.abs((Math.sin(index * 12.9898) * 43_758.5453) % 1) - 0.5;
}

/* The cut as a polyline from well off one edge to well off the other, a hair irregular. */
function cutLine(): Vector2[] {
  const left = -COVER_X - 2;
  const right = COVER_X + 2;
  const slope = CUT_DIRECTION.y / CUT_DIRECTION.x;
  function yAt(x: number): number {
    return CUT_CENTER.y + (x - CUT_CENTER.x) * slope;
  }
  const points: Vector2[] = [];
  const steps = 200;
  for (let step = 0; step <= steps; step += 1) {
    const x = left + ((right - left) * step) / steps;
    points.push(
      new Vector2(x, yAt(x)).add(CUT_NORMAL.clone().multiplyScalar(jitter(step) * 0.012)),
    );
  }
  return points;
}

interface HalfBuild {
  half: CoupeHalf;
  resources: Resource[];
}

function buildHalf(
  outline: Vector2[],
  side: 1 | -1,
  textures: { paper: CanvasTexture; washi: CanvasTexture },
): HalfBuild {
  const geometry = new ShapeGeometry(new Shape(outline));
  const position = geometry.getAttribute("position");
  const uv: number[] = [];
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    uv.push(
      (position.getX(vertex) + COVER_X) / (COVER_X * 2),
      (position.getY(vertex) + COVER_Y) / (COVER_Y * 2),
    );
  }
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  /* Pivot each half on the cut under the middle of the screen, so it turns from the cut. */
  geometry.translate(-CUT_CENTER.x, -CUT_CENTER.y, 0);
  const front = new MeshBasicMaterial({ map: textures.paper, side: FrontSide, toneMapped: false });
  const back = new MeshBasicMaterial({ map: textures.washi, side: DoubleSide, toneMapped: false });
  const group = new Group();
  group.position.set(CUT_CENTER.x, CUT_CENTER.y, 0);
  group.add(new Mesh(geometry, front), new Mesh(geometry, back));
  return { half: { group, side, front }, resources: [geometry, front, back] };
}

function buildHalves(textures: { paper: CanvasTexture; washi: CanvasTexture }): {
  halves: CoupeHalf[];
  resources: Resource[];
} {
  const outline = cutLine();
  const left = -COVER_X - 2;
  const right = COVER_X + 2;
  /* Each half is a simple polygon: the top (or bottom) edge, then the cut traced back the other way. The lower half
     closes along its bottom edge first (`left → right`) so the outline joins its ends without the path crossing itself
     and leaving the far corner bare. */
  const upper = [new Vector2(left, COVER_Y), ...outline, new Vector2(right, COVER_Y)];
  const lower = [
    new Vector2(left, -COVER_Y),
    new Vector2(right, -COVER_Y),
    ...outline.toReversed(),
  ];
  const builds = [buildHalf(upper, 1, textures), buildHalf(lower, -1, textures)];
  return {
    halves: builds.map((build) => build.half),
    resources: builds.flatMap((build) => build.resources),
  };
}

/* One geometry for the star, reused for the solid shuriken and its ghosts. */
function starGeometry(): BufferGeometry {
  const parsed = new SVGLoader().parse(
    `<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${STAR}"/></svg>`,
  );
  const shapes = parsed.paths[0]?.toShapes() ?? [];
  const geometry = new ShapeGeometry(shapes, 24);
  geometry.translate(-STAR_CENTER_X, -STAR_CENTER_Y, 0);
  geometry.scale(STAR_TO_WORLD, -STAR_TO_WORLD, STAR_TO_WORLD);
  return geometry;
}

function starGroup(geometry: BufferGeometry, material: MeshBasicMaterial, order: number): Group {
  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = order;
  const group = new Group();
  group.add(mesh);
  return group;
}

/* The brand shuriken and its three ghosts, the Fushimi star drawn over the paper. */
function buildStars(fushimi: Color): {
  star: Group;
  ghosts: Group[];
  resources: Resource[];
} {
  const geometry = starGeometry();
  const solid = new MeshBasicMaterial({ color: fushimi, side: DoubleSide, depthTest: false });
  const star = starGroup(geometry, solid, 10);
  const resources: Resource[] = [geometry, solid];
  const ghosts: Group[] = [];
  for (let index = 0; index < GHOST_COUNT; index += 1) {
    const material = new MeshBasicMaterial({
      color: fushimi,
      transparent: true,
      opacity: 0.36 - index * 0.1,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
    });
    ghosts.push(starGroup(geometry, material, 9));
    resources.push(material);
  }
  return { star, ghosts, resources };
}

/* The whole coupe: the two paper halves pivoted on the cut (the questions' sheet as the printed face, a washi back,
   both laid once over the frame), the hairline left behind, the brand shuriken and its three ghosts. The canvas is
   transparent: the night and the closing wait in the DOM behind it, uncovered as the halves fall away. The sheet is
   the questions' own sheet, so the held paper reads as the page the questions scrolled by on, not a cool grey panel. */
export function createCoupeWorld(
  canvas: HTMLCanvasElement,
  tier: QualityTier,
  sheet: HTMLCanvasElement,
): CoupeWorld {
  const fushimi = toColor(resolveColor(canvas, "--color-fushimi"));
  const kome = resolveColor(canvas, "--color-kome");
  const [red, green, blue] = kome;
  const washiBase: Rgb = [red - 8, green - 11, blue - 16];
  const fujiDeep = toColor(resolveColor(canvas, "--color-fuji-deep"));

  const paper = sheetTexture(sheet);
  const washiCanvas = document.createElement("canvas");
  washiCanvas.width = sheet.width;
  washiCanvas.height = sheet.height;
  drawPaper(washiCanvas, washiBase, tier === "full" ? 720 : 320);
  const washi = sheetTexture(washiCanvas);

  const root = new Group();
  const halfBuild = buildHalves({ paper, washi });
  for (const half of halfBuild.halves) {
    root.add(half.group);
  }

  const slitMaterial = new MeshBasicMaterial({
    color: fujiDeep,
    transparent: true,
    depthTest: false,
  });
  const slitGeometry = new PlaneGeometry(1, 1);
  const slit = new Mesh(slitGeometry, slitMaterial);
  slit.renderOrder = 5;
  root.add(slit);

  const stars = buildStars(fushimi);
  root.add(stars.star, ...stars.ghosts);

  return {
    root,
    halves: halfBuild.halves,
    slit,
    star: stars.star,
    ghosts: stars.ghosts,
    cut: {
      center: CUT_CENTER.clone(),
      direction: CUT_DIRECTION.clone(),
      normal: CUT_NORMAL.clone(),
    },
    paper,
    washi,
    sheetAspect: sheet.width / sheet.height,
    resources: [
      ...halfBuild.resources,
      slitGeometry,
      slitMaterial,
      ...stars.resources,
      paper,
      washi,
    ],
  };
}

export function disposeCoupeWorld(world: CoupeWorld): void {
  for (const resource of world.resources) {
    resource.dispose();
  }
}
