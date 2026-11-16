import { describe, expect, it } from "vitest";

import {
  computeHubLayout,
  DESK_GEOMETRY,
  PHONE_GEOMETRY,
  type ToolMark,
} from "../src/agents/tool-hub-layout.ts";

function mark(slug: string, yours = false): ToolMark {
  return { slug, title: slug, hex: "1E2629", path: "M0 0h1v1h-1z", yours: yours || undefined };
}

function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
}

const left = [
  mark("gmail"),
  mark("shopify"),
  mark("stripe"),
  mark("zendesk"),
  mark("calendar"),
  mark("brevo"),
];
const right = [
  mark("odoo"),
  mark("sage"),
  mark("sheets"),
  mark("notion"),
  mark("hubspot"),
  mark("yours", true),
];

describe("computeHubLayout", () => {
  const layout = computeHubLayout(DESK_GEOMETRY, left, right);

  it("places one tile and one wire per tool, left then right", () => {
    expect(layout.tiles).toHaveLength(12);
    expect(layout.wires).toHaveLength(12);
    expect(layout.tiles.map((tile) => tile.mark.slug)).toEqual([
      "gmail",
      "shopify",
      "stripe",
      "zendesk",
      "calendar",
      "brevo",
      "odoo",
      "sage",
      "sheets",
      "notion",
      "hubspot",
      "yours",
    ]);
    expect(layout.tiles.slice(0, 6).every((tile) => tile.side === "left")).toBe(true);
    expect(layout.tiles.slice(6).every((tile) => tile.side === "right")).toBe(true);
  });

  it("keeps every tile inside the box", () => {
    for (const tile of layout.tiles) {
      expect(tile.xPercent).toBeGreaterThanOrEqual(0);
      expect(tile.xPercent).toBeLessThanOrEqual(100);
      expect(tile.yPercent).toBeGreaterThanOrEqual(0);
      expect(tile.yPercent).toBeLessThanOrEqual(100);
    }
  });

  it("mirrors the two sides across the centre", () => {
    const gmail = required(layout.tiles[0], "expected the gmail tile");
    const odoo = required(
      layout.tiles.find((tile) => tile.mark.slug === "odoo"),
      "expected the odoo tile",
    );
    expect(gmail.xPercent + odoo.xPercent).toBeCloseTo(100, 5);
    expect(gmail.yPercent).toBeCloseTo(odoo.yPercent, 5);
  });

  it("leaves the owner's own software a dashed, flowless wire", () => {
    const yours = required(layout.wires.at(-1), "expected a wire");
    expect(yours.slug).toBe("yours");
    expect(yours.pending).toBe(true);
    expect(yours.delay).toBe(0);
    expect(layout.wires.slice(0, -1).every((wire) => !wire.pending)).toBe(true);
  });

  it("staggers the live flows so no two share a start", () => {
    const starts = layout.wires.filter((wire) => !wire.pending).map((wire) => wire.delay);
    expect(new Set(starts).size).toBe(starts.length);
    expect(layout.wires.every((wire) => wire.duration > 0)).toBe(true);
  });

  it("draws the ring closed and the ink stroke open, and centres the seal", () => {
    expect(layout.octagon.startsWith("M")).toBe(true);
    expect(layout.octagon.endsWith("Z")).toBe(true);
    expect(layout.draw).not.toContain("Z");
    expect(layout.drawLength).toBeCloseTo(16 * DESK_GEOMETRY.reach * Math.tan(Math.PI / 8), 5);
    expect(layout.sealXPercent).toBeCloseTo(50, 5);
    expect(layout.viewBox).toBe("0 0 1180 540");
  });

  it("scales the phone layout to four tools a side", () => {
    const phone = computeHubLayout(PHONE_GEOMETRY, left.slice(0, 4), right.slice(0, 4));
    expect(phone.tiles).toHaveLength(8);
    expect(phone.viewBox).toBe("0 0 390 440");
  });
});
