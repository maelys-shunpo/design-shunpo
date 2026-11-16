import "../src/styles/globals.css";
import { type Object3D, PerspectiveCamera, Raycaster, Vector2, Vector3 } from "three";
import { afterEach, describe, expect, it } from "vitest";

import { poseCoupe } from "../src/scene/coupe-pose.ts";
import { createPaperSheet } from "../src/scene/coupe-sheet.ts";
import {
  type CoupeWorld,
  createCoupeWorld,
  disposeCoupeWorld,
  SCREEN_HEIGHT,
  sheetFraming,
} from "../src/scene/coupe-world.ts";

/* The questions' unfolded sheet, as the scene receives it: a 16 by 10 picture. */
function sheet(): HTMLCanvasElement {
  const picture = document.createElement("canvas");
  picture.width = 160;
  picture.height = 100;
  return picture;
}

let world: CoupeWorld | undefined;
let host: HTMLDivElement | undefined;

function build(): CoupeWorld {
  host = document.createElement("div");
  host.dataset["direction"] = "agents";
  const canvas = document.createElement("canvas");
  host.append(canvas);
  document.body.append(host);
  world = createCoupeWorld(canvas, "light", sheet());
  return world;
}

afterEach(() => {
  if (world !== undefined) {
    disposeCoupeWorld(world);
  }
  host?.remove();
  world = undefined;
  host = undefined;
});

/* The paper faces of the two halves, posed and placed in the world: the first mesh of each half's group. */
function paperFaces(built: CoupeWorld, aspect: number): Object3D[] {
  poseCoupe(built, new PerspectiveCamera(), { aspect, progress: 0 });
  built.root.updateMatrixWorld(true);
  return built.halves
    .map((half) => half.group.children[0])
    .filter((face): face is Object3D => face !== undefined);
}

/* The frame points, every 0.2 world units, left blank by the paper faces when a ray is cast through them. */
function barePoints(faces: Object3D[], aspect: number): string[] {
  const halfWidth = (SCREEN_HEIGHT / 2) * aspect;
  const raycaster = new Raycaster();
  const points: Vector2[] = [];
  for (let x = -halfWidth; x <= halfWidth; x += 0.2) {
    for (let y = -SCREEN_HEIGHT / 2; y <= SCREEN_HEIGHT / 2; y += 0.2) {
      points.push(new Vector2(x, y));
    }
  }
  return points
    .filter((point) => {
      raycaster.set(new Vector3(point.x, point.y, 5), new Vector3(0, 0, -1));
      return raycaster.intersectObjects(faces).length === 0;
    })
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`);
}

describe("the coupe's sheet at rest", () => {
  it.each([1, 1.6, 2.4])(
    "covers the whole frame with paper at an aspect of %s, with no hole along the cut",
    (aspect) => {
      expect(barePoints(paperFaces(build(), aspect), aspect)).toEqual([]);
    },
  );

  it("shows the page's own Kome, untouched by the renderer's tone mapping", () => {
    const built = build();

    for (const half of built.halves) {
      expect(half.front.toneMapped).toBe(false);
    }
  });
});

/* Where a point of the frame lands on the sheet, through the half's 24 × 12 world-unit UVs and the framing. */
function onSheet(point: Vector2, aspect: number): Vector2 {
  const { repeat, offset } = sheetFraming(aspect, 1.6);
  return new Vector2(
    ((point.x + 12) / 24) * repeat.x + offset.x,
    ((point.y + 6) / 12) * repeat.y + offset.y,
  );
}

describe("createPaperSheet", () => {
  it.each(["light", "full"] as const)(
    "draws the page's Kome once, landscape and sized to the %s tier",
    (tier) => {
      host = document.createElement("div");
      host.dataset["direction"] = "agents";
      document.body.append(host);

      const picture = createPaperSheet(host, tier);

      expect(picture.width / picture.height).toBeCloseTo(1.6, 1);
      expect(picture.width).toBeGreaterThanOrEqual(416);
    },
  );
});

describe("sheetFraming", () => {
  it("lays the sheet once over the frame, edge to edge, as the poster's cover does", () => {
    const corner = new Vector2((SCREEN_HEIGHT / 2) * 1.6, SCREEN_HEIGHT / 2);

    expect(onSheet(corner.clone().negate(), 1.6).x).toBeCloseTo(0);
    expect(onSheet(corner.clone().negate(), 1.6).y).toBeCloseTo(0);
    expect(onSheet(corner, 1.6).x).toBeCloseTo(1);
    expect(onSheet(corner, 1.6).y).toBeCloseTo(1);
  });

  it("crops a wider frame's height and a narrower frame's width, never stretching the sheet", () => {
    const wide = new Vector2((SCREEN_HEIGHT / 2) * 2.4, SCREEN_HEIGHT / 2);
    const narrow = new Vector2((SCREEN_HEIGHT / 2) * 1, SCREEN_HEIGHT / 2);

    expect(onSheet(wide, 2.4).x).toBeCloseTo(1);
    expect(onSheet(wide, 2.4).y).toBeLessThan(1);
    expect(onSheet(narrow, 1).x).toBeLessThan(1);
    expect(onSheet(narrow, 1).y).toBeCloseTo(1);
  });
});
