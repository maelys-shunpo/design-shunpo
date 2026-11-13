import { describe, expect, it } from "vitest";

import { cookieLayout, stripMatrix } from "../src/agents/fortune-geometry.ts";

const ORIGAMI = {
  paper: {
    topLeft: [112.4, 223.8],
    topRight: [172.9, 201.3],
    bottomLeft: [128.7, 267.7],
  },
  paperTop: 392,
  paperTopShare: 0.97,
  spread: 14,
} as const;

describe("cookieLayout", () => {
  it("lays the scene out as the approved 690 px prototype", () => {
    const layout = cookieLayout(690, false, ORIGAMI);

    expect(layout.panelWidth).toBe(270);
    expect(layout.panelHeight).toBe(135);
    expect(layout.paperLeft).toBe(75);
    expect(layout.paperTop).toBe(392);
    expect(layout.linkTop).toBe(551);
    expect(layout.sceneHeight).toBe(599);
    expect(layout.button).toEqual({ left: 100, top: 16, width: 490, height: 408 });
    expect(layout.art).toEqual({ left: 0, width: 690 });
    expect(layout.restOffset).toBe(88);
  });

  it("scales with a wider scene", () => {
    const layout = cookieLayout(1380, false, ORIGAMI);

    expect(layout.panelWidth).toBe(540);
    expect(layout.paperTop).toBe(784);
  });

  it("scales how far the open halves start from each other", () => {
    expect(cookieLayout(690, false, ORIGAMI).spread).toBe(14);
    expect(cookieLayout(1380, false, ORIGAMI).spread).toBe(28);
  });

  it("enlarges the cookie on phones, its white margins running past the edges", () => {
    const layout = cookieLayout(350, true, ORIGAMI);

    expect(layout.art.left).toBeCloseTo(-17.5);
    expect(layout.art.width).toBeCloseTo(385);
    expect(layout.button.left).toBe(38);
    expect(layout.button.width).toBe(274);
  });

  it("sets the paper under the enlarged cookie on phones, two panels across the width", () => {
    const layout = cookieLayout(350, true, ORIGAMI);

    expect(layout.panelWidth).toBe(165);
    expect(layout.panelHeight).toBe(102);
    expect(layout.paperLeft).toBe(10);
    expect(layout.paperTop).toBe(Math.round(((385 * 793) / 1380) * 0.97));
  });
});

describe("stripMatrix", () => {
  it("maps the paper's box onto the strip sticking out of the fold", () => {
    const matrix = stripMatrix(
      { topLeft: [10, 20], topRight: [110, 20], bottomLeft: [10, 70] },
      { width: 100, height: 50 },
      [0, 0],
    );

    expect(matrix).toBe("matrix(1.0000,0.0000,0.0000,1.0000,10.0000,20.0000)");
  });
});
