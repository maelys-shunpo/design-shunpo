/* The tool hub « Vos agents travaillent dans les outils que vous avez déjà » (DESIGN.md « Vos outils reliés au
   sceau »): the SHUNPO seal in an octagon at the centre, the tools cut from the sheet down two symmetric arcs, and a
   beam of 45°-chamfered wires running each tool into the ring. Every measure is a share of the design box, so the one
   layout scales to any width. This module is pure geometry: it builds the wire and octagon paths and the tools'
   places, drawn by `ToolHub`; no DOM, so its maths is unit-tested. */

/* A tool as the hub shows it: a logo (a 24 × 24 path, simple-icons or the same shape) in its own colour. `yours`
   stands for the visitor's own software, a dashed slot wired in dashes, never a live flow, until a connector is
   built. The type the owner's single screen (`os-model`) reads too. */
export interface ToolMark {
  slug: string;
  title: string;
  hex: string;
  path: string;
  yours?: boolean | undefined;
}

/* The design box of one layout, in its own pixels: the octagon's centre and reach, a tile and the pitch of the beam,
   the chamfer of its top and base corners, where each side's bus stands, the rows (`rows`, from the centre) and insets
   (`insets`, from the edge) the paired tools share, the seal and logo sizes, the gap under the ring for the label, and
   the speed a flow travels, in px per second. */
export interface HubGeometry {
  readonly width: number;
  readonly height: number;
  readonly cx: number;
  readonly cy: number;
  readonly reach: number;
  readonly tile: number;
  readonly pitch: number;
  readonly cornerTop: number;
  readonly cornerBase: number;
  readonly busInner: number;
  readonly insets: readonly number[];
  readonly rows: readonly number[];
  readonly sealWidth: number;
  readonly logoSize: number;
  readonly labelGap: number;
  readonly speed: number;
}

/* A tool's place in the box, as shares of it so it scales: the centre of its tile and the side it sits on. */
export interface HubTile {
  readonly mark: ToolMark;
  readonly side: "left" | "right";
  readonly xPercent: number;
  readonly yPercent: number;
}

/* One wire from a tool to the ring: its path in design pixels (the SVG scales it), whether it is the dashed, flowless
   wire of the owner's own software, and — for a live wire — how long a signal takes to run it and its stagger, so no
   two signals arrive together. */
export interface HubWire {
  readonly slug: string;
  readonly d: string;
  readonly pending: boolean;
  readonly duration: number;
  readonly delay: number;
}

/* Everything `ToolHub` draws for one layout: the box and its view box, the faint octagon and the ink stroke that
   draws it (with its length, for the dash), the seal and its label as shares of the box, the tools' places, the
   wires, and the shares a tile and a logo take of the box's width. */
export interface HubLayout {
  readonly width: number;
  readonly height: number;
  readonly viewBox: string;
  readonly octagon: string;
  readonly draw: string;
  readonly drawLength: number;
  readonly sealXPercent: number;
  readonly sealYPercent: number;
  readonly sealWidthPercent: number;
  readonly sealHeightPercent: number;
  readonly labelXPercent: number;
  readonly labelYPercent: number;
  readonly tiles: readonly HubTile[];
  readonly wires: readonly HubWire[];
  readonly tilePercent: number;
  readonly logoPercent: number;
}

/* A tool resolved against the geometry: its mark, its side, its rank in the column, and the inset and row it was
   paired with, so the wire and tile maths never index the parallel arrays again. */
interface Placement {
  readonly mark: ToolMark;
  readonly side: "left" | "right";
  readonly index: number;
  readonly inset: number;
  readonly row: number;
}

/* The octagon in a box: its centre, its reach to a flat side, and the tangent that sets its corners. */
interface Ring {
  readonly cx: number;
  readonly cy: number;
  readonly reach: number;
  readonly tangent: number;
}

/* The SHUNPO seal's own box (`brand/shuriken-paths`), kept so its height follows its width. */
const SEAL_RATIO = 165.59 / 154.38;

/* A signal's dash cycle, in design pixels: a flow travels one cycle whatever the wire's length, so every wire runs at
   the one speed. */
const FLOW_CYCLE = 110;

/* The golden angle, so each wire's stagger is spread evenly without ever repeating. */
const GOLDEN = 0.618;

function octagonPath(ring: Ring): string {
  const { cx, cy, reach, tangent } = ring;
  return (
    `M${cx - reach},${cy - tangent} L${cx - tangent},${cy - reach} H${cx + tangent} ` +
    `L${cx + reach},${cy - tangent} V${cy + tangent} L${cx + tangent},${cy + reach} ` +
    `H${cx - tangent} L${cx - reach},${cy + tangent} Z`
  );
}

/* The open stroke that draws the octagon: it starts on the left edge's middle, runs the whole ring and closes back
   onto its start, so the ink can be drawn on, then wiped off, in one sweep. */
function octagonStroke(ring: Ring): string {
  const { cx, cy, reach, tangent } = ring;
  return (
    `M${cx - reach},${cy} V${cy - tangent} L${cx - tangent},${cy - reach} H${cx + tangent} ` +
    `L${cx + reach},${cy - tangent} V${cy + tangent} L${cx + tangent},${cy + reach} ` +
    `H${cx - tangent} L${cx - reach},${cy + tangent} V${cy}`
  );
}

function wirePath(geometry: HubGeometry, placement: Placement): string {
  const { width, cx, cy, reach, tile, pitch, cornerTop, cornerBase, busInner } = geometry;
  const sign = placement.side === "left" ? 1 : -1;
  const count = geometry.insets.length;
  const half = count / 2;
  const top = placement.index < half;
  const rank = top ? half - 1 - placement.index : placement.index - half;

  const tileX = placement.side === "left" ? placement.inset : width - placement.inset;
  const nearX = tileX + sign * (tile / 2);
  const rowY = cy + placement.row;

  const entry = (placement.index - (count - 1) / 2) * pitch;
  const busLeft = busInner + rank * pitch;
  const busX = placement.side === "left" ? busLeft : width - busLeft;
  const ringY = cy + entry;
  const ringX = cx - sign * reach;
  const dir = ringY > rowY ? 1 : -1;
  const baseChamfer = cornerBase + (half - 1 - rank) * 0.586 * pitch;

  return (
    `M${nearX},${rowY} H${busX - sign * cornerTop} L${busX},${rowY + dir * cornerTop} ` +
    `V${ringY - dir * baseChamfer} L${busX + sign * baseChamfer},${ringY} H${ringX}`
  );
}

function placeColumn(
  geometry: HubGeometry,
  marks: readonly ToolMark[],
  side: "left" | "right",
): readonly Placement[] {
  return marks.map((mark, index) => ({
    mark,
    side,
    index,
    inset: geometry.insets[index] ?? 0,
    row: geometry.rows[index] ?? 0,
  }));
}

function tilePlace(geometry: HubGeometry, placement: Placement): HubTile {
  const tileX = placement.side === "left" ? placement.inset : geometry.width - placement.inset;
  return {
    mark: placement.mark,
    side: placement.side,
    xPercent: (tileX / geometry.width) * 100,
    yPercent: ((geometry.cy + placement.row) / geometry.height) * 100,
  };
}

/* Build one layout from its geometry and the two columns of tools (each as long as the geometry's insets, the last of
   `right` the owner's own `yours`): the octagon and its stroke, the seal and label, every tool's place, and every
   wire with the live ones' staggered timing. */
export function computeHubLayout(
  geometry: HubGeometry,
  left: readonly ToolMark[],
  right: readonly ToolMark[],
): HubLayout {
  const { width, height, cx, cy, reach, tile, sealWidth, logoSize, labelGap, speed } = geometry;
  const tangent = reach * Math.tan(Math.PI / 8);
  const ring: Ring = { cx, cy, reach, tangent };
  const placements = [
    ...placeColumn(geometry, left, "left"),
    ...placeColumn(geometry, right, "right"),
  ];

  const tiles = placements.map((placement) => tilePlace(geometry, placement));

  let live = 0;
  const wires = placements.map((placement) => {
    const pending = placement.mark.yours === true;
    const delay = pending ? 0 : -(((live * GOLDEN) % 1) * FLOW_CYCLE) / speed;
    if (!pending) {
      live += 1;
    }
    return {
      slug: placement.mark.slug,
      d: wirePath(geometry, placement),
      pending,
      duration: FLOW_CYCLE / speed,
      delay,
    };
  });

  return {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    octagon: octagonPath(ring),
    draw: octagonStroke(ring),
    drawLength: 16 * tangent,
    sealXPercent: (cx / width) * 100,
    sealYPercent: (cy / height) * 100,
    sealWidthPercent: (sealWidth / width) * 100,
    sealHeightPercent: ((sealWidth * SEAL_RATIO) / height) * 100,
    labelXPercent: (cx / width) * 100,
    labelYPercent: ((cy + reach + labelGap) / height) * 100,
    tiles,
    wires,
    tilePercent: (tile / width) * 100,
    logoPercent: (logoSize / width) * 100,
  };
}

/* The two layouts, one wide and one for phones, after the retained mockup (the seal, the octagon drawn in ink, the
   continuous flows). The wide box carries six tools a side; the phone box four, the owner's own last on the right. */
export const DESK_GEOMETRY: HubGeometry = {
  width: 1180,
  height: 540,
  cx: 590,
  cy: 255,
  reach: 96,
  tile: 68,
  pitch: 8,
  cornerTop: 8,
  cornerBase: 6,
  busInner: 400,
  insets: [300, 236, 200, 200, 236, 300],
  rows: [-220, -132, -44, 44, 132, 220],
  sealWidth: 128,
  logoSize: 28,
  labelGap: 24,
  speed: 64,
};

export const PHONE_GEOMETRY: HubGeometry = {
  width: 390,
  height: 440,
  cx: 195,
  cy: 205,
  reach: 52,
  tile: 56,
  pitch: 6,
  cornerTop: 6,
  cornerBase: 4,
  busInner: 104,
  insets: [50, 50, 50, 50],
  rows: [-153, -51, 51, 153],
  sealWidth: 74,
  logoSize: 24,
  labelGap: 18,
  speed: 44,
};
