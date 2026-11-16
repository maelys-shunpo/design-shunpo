import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn.ts";
import {
  bleedClasses,
  type Breakpoint,
  columnsAt,
  contentClasses,
  spanClasses,
  startClasses,
} from "../lib/grid-placement.ts";

/* Where an area sits at one breakpoint: a span of content columns from a start column, "all" the content columns,
   or "bleed" from page edge to page edge. */
export type Placement = number | "all" | "bleed" | { start: number; span: number };

type Responsive = Partial<Record<Breakpoint, Placement>>;

const BREAKPOINTS: Breakpoint[] = ["base", "md", "lg"];

/* Without a placement, an area takes every content column. */
const EVERY_COLUMN: Responsive = {};

const areaVariants = cva("min-w-0", {
  variants: {
    align: {
      stretch: "self-stretch",
      start: "self-start",
      center: "self-center",
      end: "self-end",
    },
    justify: {
      stretch: "justify-self-stretch",
      start: "justify-self-start",
      center: "justify-self-center",
      end: "justify-self-end",
    },
    /* Titles, photographs and graphic pieces may run past their columns; text and controls never do. */
    overflow: {
      contain: "",
      visible: "overflow-visible",
    },
  },
  defaultVariants: { align: "stretch", justify: "stretch", overflow: "contain" },
});

function centredStart(span: number, columns: number): number {
  return Math.floor((columns - span) / 2) + 1;
}

/* A plain number centres the span on the content columns, so a centred composition needs no arithmetic. */
function classesAt(breakpoint: Breakpoint, placement: Placement): string {
  const columns = columnsAt[breakpoint];
  if (placement === "bleed") {
    return bleedClasses[breakpoint];
  }
  if (placement === "all") {
    return contentClasses[breakpoint];
  }
  const { start, span } =
    typeof placement === "number"
      ? { start: centredStart(placement, columns), span: placement }
      : placement;
  const fitted = Math.min(span, columns - start + 1);
  return `${startClasses[breakpoint][start]} ${spanClasses[breakpoint][fitted]}`;
}

/* A smaller screen without its own placement takes all its content columns. */
export function placementClasses(columns: Responsive): string {
  return BREAKPOINTS.map((breakpoint) => classesAt(breakpoint, columns[breakpoint] ?? "all")).join(
    " ",
  );
}

interface GridAreaProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof areaVariants> {
  /* Placement per breakpoint, e.g. { lg: { start: 4, span: 9 } } or { md: 6, lg: 8 } for a centred span. */
  columns?: Responsive;
  as?: "div" | "header" | "figure" | "aside" | "article" | "li";
}

/* One area of the page grid. Interfaces placed in it keep their own inner layout. */
export function GridArea({
  columns = EVERY_COLUMN,
  align,
  justify,
  overflow,
  as: Element = "div",
  className,
  ...props
}: GridAreaProps) {
  return (
    <Element
      data-slot="grid-area"
      className={cn(
        placementClasses(columns),
        areaVariants({ align, justify, overflow }),
        className,
      )}
      {...props}
    />
  );
}
