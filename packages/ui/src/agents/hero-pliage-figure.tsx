import { useId } from "react";

import { PEBBLE } from "../brand/shuriken-paths.ts";
import { cn } from "../lib/cn.ts";
import { CENTRE, HOLE, labelPoint, VIEW } from "./hero-pliage-geometry.ts";
import { type Paper, PliageSheet, type SheetMark } from "./hero-pliage-sheet.tsx";
import {
  FINAL_SIGN,
  foldedSheet,
  POSTER_SIGN,
  posterSheet,
  sheetAttributes,
  signAttributes,
} from "./hero-pliage-state.ts";

export interface PliageSheetSpec {
  id: string;
  /* The tool's family, printed under its sheet on the table: « Messagerie », « CRM »… */
  label: string;
  mark: SheetMark;
  paper: Paper;
}

/* The caption sits under the pebble, in the figure's own units. */
const CAPTION_Y = 561;
const TEXT = "fill-foreground font-mono text-xs tracking-wide uppercase";

interface PliageFigureProps {
  sheets: readonly PliageSheetSpec[];
  /* table: the four sheets laid flat, the first frame the scroll folds; sign: the folded star on its pebble. */
  moment: "table" | "sign";
  /* Read once in place of the drawing, the caption's last words included. */
  label: string;
  /* The line under the pebble: `before` while the sheets lie apart, `after` once they form the sign. */
  caption: { before: string; after: string };
  className?: string | undefined;
}

/* The shadow a sheet casts on the table, and the blur of its shadow once it lifts off. */
function Filters({ contact, lift }: { contact: string; lift: string }) {
  return (
    <defs>
      <filter id={contact} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow
          dx="0"
          dy="4"
          stdDeviation="5"
          floodColor="currentColor"
          floodOpacity="0.14"
        />
      </filter>
      <filter id={lift} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </defs>
  );
}

/* Each tool's family printed under its sheet on the table. */
function TableLabels({ sheets }: { sheets: readonly PliageSheetSpec[] }) {
  return sheets.map((sheet, index) => {
    const [x, y] = labelPoint(index);
    return (
      <text
        key={sheet.id}
        data-pliage-label={index}
        x={x}
        y={y}
        textAnchor="middle"
        className={TEXT}
      >
        {`${String(index + 1).padStart(2, "0")} · ${sheet.label}`}
      </text>
    );
  });
}

/* The line under the pebble, unseen on the table where the sheets carry their own names: the first words arrive
   once the kites have gathered, the last ones are drawn over them until the scene turns them. The figure's label
   reads the last words once. */
function Caption({
  caption,
  onTable,
}: {
  caption: PliageFigureProps["caption"];
  onTable: boolean;
}) {
  return (
    <>
      {onTable ? (
        <text
          data-pliage-word="before"
          x={CENTRE}
          y={CAPTION_Y}
          textAnchor="middle"
          className={cn(TEXT, "opacity-0")}
        >
          {caption.before}
        </text>
      ) : null}
      <text
        data-pliage-word="after"
        x={CENTRE}
        y={CAPTION_Y}
        textAnchor="middle"
        className={cn(TEXT, onTable && "opacity-0")}
      >
        {caption.after}
      </text>
    </>
  );
}

/* The illustration of « Pliage », drawn at one moment of the story, framed the same at both moments. Every value
   comes from the state functions the scroll choreography writes, so the painted table and the folded sign meet it
   exactly. */
export function PliageFigure({ sheets, moment, label, caption, className }: PliageFigureProps) {
  const id = useId().replaceAll(":", "");
  const filters = { contact: `pliage-contact-${id}`, lift: `pliage-lift-${id}` };
  const onTable = moment === "table";
  const sign = signAttributes(onTable ? POSTER_SIGN : FINAL_SIGN);
  return (
    <svg
      role={label === "" ? undefined : "img"}
      aria-label={label === "" ? undefined : label}
      aria-hidden={label === "" ? true : undefined}
      viewBox={`0 0 ${String(VIEW)} ${String(VIEW)}`}
      className={cn("block h-auto w-full overflow-visible text-foreground", className)}
      {...(onTable ? { "data-pliage-animated": "" } : { "data-pliage-still": "" })}
    >
      <Filters contact={filters.contact} lift={filters.lift} />
      <g data-pliage="pebble" transform={sign.pebble.transform} opacity={sign.pebble.opacity}>
        <path d={PEBBLE} transform={sign.pebbleShape} className="fill-fushimi" />
      </g>
      <g data-pliage="star" transform={sign.star}>
        {sheets.map((sheet, index) => (
          <PliageSheet
            key={sheet.id}
            index={index}
            paper={sheet.paper}
            mark={sheet.mark}
            filters={filters}
            attributes={sheetAttributes(
              onTable ? posterSheet(index) : foldedSheet(index),
              onTable ? POSTER_SIGN.turn : FINAL_SIGN.turn,
            )}
          />
        ))}
        <circle data-pliage="hole" r={HOLE} transform={sign.hole} className="fill-fushimi" />
      </g>
      {onTable ? <TableLabels sheets={sheets} /> : null}
      <Caption caption={caption} onTable={onTable} />
    </svg>
  );
}
