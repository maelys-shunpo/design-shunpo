// prettier-ignore
import {
  type BufferGeometry, CanvasTexture, Color, DoubleSide, Float32BufferAttribute, FrontSide, Group,
  Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace, Vector2,
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

import { STAR } from "../brand/shuriken-paths.ts";
import { type Rgb, resolveColor } from "../lib/css-color.ts";
import type { QualityTier } from "../lib/quality-tier.ts";
import { GHOST_COUNT } from "../motion/coupe-geometry.ts";

/* The sheet covers this half-width and half-height in world units: wide enough that the camera's eight-unit-tall
   frame is filled at any aspect the held stage takes, so the halves never need rebuilding. */
const COVER_X = 12;
const COVER_Y = 6;
/* The visible height the camera frames, used to throw each half clear of the screen as the page gives. */
export const SCREEN_HEIGHT = 8;

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

/* A sheet of paper as a texture: the base colour, a dusting of lighter and darker flecks, then short fibres. A warmer,
   more fibrous base reads as the washi backing; the lighter one as the printed face. */
function paperTexture(base: Rgb, tier: QualityTier, fibres: number): CanvasTexture {
  const size = tier === "full" ? 512 : 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context === null) {
    return new CanvasTexture(canvas);
  }
  const [red, green, blue] = base;
  context.fillStyle = `rgb(${String(red)}, ${String(green)}, ${String(blue)})`;
  context.fillRect(0, 0, size, size);
  for (let fleck = 0; fleck < size * 10; fleck += 1) {
    const light = Math.random() < 0.5;
    context.fillStyle = `rgba(${light ? "255,255,250" : "150,135,112"},${String(Math.random() * 0.05)})`;
    context.beginPath();
    context.arc(Math.random() * size, Math.random() * size, Math.random() * 18 + 4, 0, Math.PI * 2);
    context.fill();
  }
  for (let fibre = 0; fibre < fibres; fibre += 1) {
    let x = Math.random() * size;
    let y = Math.random() * size;
    let angle = Math.random() * Math.PI * 2;
    context.strokeStyle = `rgba(150,135,112,${String(0.06 + Math.random() * 0.12)})`;
    context.lineWidth = Math.random() * 0.9 + 0.3;
    context.beginPath();
    context.moveTo(x, y);
    for (let step = 0; step < 8; step += 1) {
      angle += (Math.random() - 0.5) * 0.6;
      x += Math.cos(angle) * 7;
      y += Math.sin(angle) * 7;
      context.lineTo(x, y);
    }
    context.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2.5, 1.3);
  return texture;
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
  const front = new MeshBasicMaterial({ map: textures.paper, side: FrontSide });
  const back = new MeshBasicMaterial({ map: textures.washi, side: DoubleSide });
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
  const upper = [new Vector2(left, COVER_Y), ...outline, new Vector2(right, COVER_Y)];
  const lower = [
    new Vector2(left, -COVER_Y),
    ...outline.toReversed(),
    new Vector2(right, -COVER_Y),
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

/* The whole coupe: the two paper halves pivoted on the cut (a printed face, a washi back), the hairline left behind,
   the brand shuriken and its three ghosts. The canvas is transparent: the night and the closing wait in the DOM
   behind it, uncovered as the halves fall away. */
export function createCoupeWorld(canvas: HTMLCanvasElement, tier: QualityTier): CoupeWorld {
  const fushimi = toColor(resolveColor(canvas, "--color-fushimi"));
  const kome = resolveColor(canvas, "--color-kome");
  const [red, green, blue] = kome;
  const washiBase: Rgb = [red - 8, green - 11, blue - 16];
  const fujiDeep = toColor(resolveColor(canvas, "--color-fuji-deep"));

  const paper = paperTexture(kome, tier, tier === "full" ? 520 : 240);
  const washi = paperTexture(washiBase, tier, tier === "full" ? 720 : 320);

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
