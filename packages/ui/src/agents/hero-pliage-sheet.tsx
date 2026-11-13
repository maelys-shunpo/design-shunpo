import { cva } from "class-variance-authority";

import { KITE, LEFT_FLAP, type Point, points, RIGHT_FLAP, SHEET } from "./hero-pliage-geometry.ts";
import { type FlapAttributes, MARK_INK, type SheetAttributes } from "./hero-pliage-state.ts";

export type Paper = "white" | "shiro" | "frost" | "tenku";

/* Each tool's sheet in a paper of the charter, dyed through: a folded flap shows the same tint, so each branch of
   the star reads as one kite. */
const paperVariants = cva("stroke-rule", {
  variants: {
    paper: {
      white: "fill-surface",
      shiro: "fill-shiro",
      frost: "fill-frost",
      tenku: "fill-agents-info-tint",
    },
  },
});

export interface SheetMark {
  /* A simple-icons path, drawn in ink on the kite's axis, upright on screen. */
  path: string;
}

/* A folding diagram's valley fold: a dashed line along the crease, before the flap turns over it. */
const CREASE_DASH = "3 4";
/* Where each flap lies once folded: the tip, its crease's end and the corner brought over. */
const RIGHT_FOOTPRINT: readonly Point[] = [SHEET.tip, SHEET.creaseRight, SHEET.folded];
const LEFT_FOOTPRINT: readonly Point[] = [
  SHEET.tip,
  SHEET.creaseLeft,
  [-SHEET.folded[0], SHEET.folded[1]],
];
/* The half of the folded branch away from the light, a half tone darker: the ridge, drawn by light. */
const SHADED_HALF: readonly Point[] = [SHEET.tip, SHEET.creaseRight, SHEET.centre];

interface FlapProps {
  side: "right" | "left";
  paper: Paper;
  attributes: FlapAttributes;
}

/* A flap's shadow on the kite while it stands, then the flap itself: its paper, the light that rakes its edge as
   it passes upright, and the shade on it as it comes down. */
function Flap({ side, paper, attributes }: FlapProps) {
  const shape = points(side === "right" ? RIGHT_FLAP : LEFT_FLAP);
  const footprint = points(side === "right" ? RIGHT_FOOTPRINT : LEFT_FOOTPRINT);
  return (
    <>
      <polygon
        data-pliage-cast={side}
        points={footprint}
        opacity={attributes.cast}
        className="fill-fuji"
      />
      <g data-pliage-flap={side} transform={attributes.transform}>
        <polygon
          points={shape}
          className={paperVariants({ paper })}
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          data-pliage-face="light"
          points={shape}
          opacity={attributes.light}
          className="fill-surface"
        />
        <polygon
          data-pliage-face="shade"
          points={shape}
          opacity={attributes.shade}
          className="fill-fuji"
        />
      </g>
    </>
  );
}

interface CreaseProps {
  side: "right" | "left";
  opacity: string;
}

function Crease({ side, opacity }: CreaseProps) {
  const [x, y] = side === "right" ? SHEET.creaseRight : SHEET.creaseLeft;
  return (
    <line
      data-pliage-crease={side}
      x1={SHEET.tip[0]}
      y1={SHEET.tip[1]}
      x2={x}
      y2={y}
      opacity={opacity}
      strokeDasharray={CREASE_DASH}
      vectorEffect="non-scaling-stroke"
      className="stroke-foreground/40"
    />
  );
}

interface PliageSheetProps {
  index: number;
  paper: Paper;
  mark: SheetMark;
  attributes: SheetAttributes;
  /* The figure's filters: the shadow a sheet casts on the table, and the blur of its shadow once it lifts off. */
  filters: { contact: string; lift: string };
}

/* One tool's sheet: its loose shadow when lifted, then the kite that stays, its mark, the diagonal and the two
   creases of the diagram, the two flaps that fold over it, and the shaded half of the folded branch. */
export function PliageSheet({ index, paper, mark, attributes, filters }: PliageSheetProps) {
  return (
    <g data-pliage-sheet={index} transform={attributes.transform}>
      <polygon
        data-pliage-lift
        points={points(KITE)}
        transform={attributes.liftShadow.transform}
        opacity={attributes.liftShadow.opacity}
        filter={`url(#${filters.lift})`}
        className="fill-fuji"
      />
      <g filter={`url(#${filters.contact})`}>
        <polygon
          points={points(KITE)}
          className={paperVariants({ paper })}
          vectorEffect="non-scaling-stroke"
        />
        <line
          data-pliage-axis
          x1={SHEET.tip[0]}
          y1={SHEET.tip[1]}
          x2={SHEET.centre[0]}
          y2={SHEET.centre[1]}
          opacity={attributes.axis}
          vectorEffect="non-scaling-stroke"
          className="stroke-foreground/10"
        />
        <g
          data-pliage-mark
          transform={attributes.mark}
          opacity={MARK_INK}
          className="fill-foreground"
        >
          <path d={mark.path} />
        </g>
        <Crease side="right" opacity={attributes.rightCrease} />
        <Crease side="left" opacity={attributes.leftCrease} />
        <Flap side="right" paper={paper} attributes={attributes.right} />
        <Flap side="left" paper={paper} attributes={attributes.left} />
        <polygon
          data-pliage-ridge
          points={points(SHADED_HALF)}
          opacity={attributes.ridge}
          className="fill-fuji"
        />
      </g>
    </g>
  );
}
