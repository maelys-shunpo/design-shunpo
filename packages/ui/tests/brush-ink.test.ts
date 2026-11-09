import { describe, expect, it } from "vitest";

import { blotImage, inkImage } from "../src/lib/brush-ink.ts";
import { paintBrushStroke } from "../src/lib/brush-stroke.ts";

const CANVAS = { width: 640, height: 460 };

const strokes = [
  paintBrushStroke({
    points: [
      [70, 18],
      [70, 444],
    ],
    width: 13,
    seed: 1,
  }),
  paintBrushStroke({
    points: [
      [18, 34],
      [624, 34],
    ],
    width: 13,
    seed: 2,
  }),
];

function markupOf(image: string): string {
  return decodeURIComponent(image.replace("data:image/svg+xml,", ""));
}

describe("inkImage", () => {
  it("is a self-contained SVG image the size of the canvas", () => {
    const image = inkImage(strokes, CANVAS);

    expect(image).toMatch(/^data:image\/svg\+xml,/u);
    expect(markupOf(image)).toContain("viewBox='0 0 640 460'");
  });

  it("paints every stroke body, bristle and groove once", () => {
    const markup = markupOf(inkImage(strokes, CANVAS));
    const traces = strokes.flatMap((stroke) => [
      stroke.body,
      ...stroke.bristles.map((bristle) => bristle.path),
      ...stroke.grooves.map((groove) => groove.path),
    ]);

    for (const trace of traces) {
      expect(markup.split(trace)).toHaveLength(2);
    }
  });

  it("roughens the ink once for the whole image, with ragged edges and uneven tone", () => {
    const markup = markupOf(inkImage(strokes, CANVAS));

    expect(markup.match(/<filter/gu)).toHaveLength(1);
    expect(markup).toContain("feDisplacementMap");
    expect(markup).toContain("feTurbulence");
  });

  it("escapes characters a data URL cannot carry", () => {
    const image = inkImage(strokes, CANVAS);

    expect(image).not.toMatch(/[<>#"]/u);
  });
});

describe("blotImage", () => {
  it("prints an imperfect round of ink, the same for a seed and another for the next", () => {
    const blot = blotImage(11);

    expect(blot.startsWith("data:image/svg+xml,")).toBe(true);
    expect(decodeURIComponent(blot)).toContain("filter='url(#ink)'");
    expect(blotImage(11)).toBe(blot);
    expect(blotImage(23)).not.toBe(blot);
  });
});
