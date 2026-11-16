import type { CSSProperties } from "react";
import type { SimpleIcon } from "simple-icons";

import { cn } from "../lib/cn.ts";

declare module "react" {
  interface CSSProperties {
    /* A scattered tool window around the promise (`agents-converge-place`, `agents-converge-card`). */
    "--converge-x"?: string;
    "--converge-y"?: string;
    "--converge-x-wide"?: string;
    "--converge-y-wide"?: string;
    "--converge-turn"?: string;
    "--converge-depth"?: string;
  }
}

export interface GlimpseField {
  label: string;
  value: string;
}

interface Point {
  x: number;
  y: number;
}

/* Where a window lies around the promise: its centre as shares of the stage, in the side margins from wide screens
   (`wide`) and above or below the copy on tablets (`narrow`, or hidden there without one); its turn in degrees; its
   depth as a scale (under 1 is further away). */
export interface GlimpsePlace {
  wide: Point;
  narrow?: Point | undefined;
  turn: number;
  depth: number;
}

interface ToolGlimpseProps {
  id: string;
  icon: SimpleIcon;
  app: string;
  context: string;
  title: string;
  detail: string;
  fields: readonly GlimpseField[];
  place: GlimpsePlace;
  className?: string | undefined;
}

function share(value: number): string {
  return `${String(value * 100)}%`;
}

function placeStyle({ wide, narrow, turn, depth }: GlimpsePlace): CSSProperties {
  return {
    "--converge-x": share((narrow ?? wide).x),
    "--converge-y": share((narrow ?? wide).y),
    "--converge-x-wide": share(wide.x),
    "--converge-y-wide": share(wide.y),
    "--converge-turn": `${String(turn)}deg`,
    "--converge-depth": String(depth),
  };
}

/* One tool as the team sees it today, in its own window: the app, the record open in it and two of its fields. */
export function ToolGlimpse({
  id,
  icon,
  app,
  context,
  title,
  detail,
  fields,
  place,
  className,
}: ToolGlimpseProps) {
  return (
    <li
      data-slot="tool-glimpse"
      className={cn(
        "agents-converge-place",
        place.narrow === undefined && "hidden xl:block",
        className,
      )}
      style={placeStyle(place)}
    >
      <div
        data-converge-glimpse={id}
        className="agents-sheet agents-sheet-ring agents-converge-card overflow-clip text-agents-ink agents-sheet-float will-change-transform agents-sheet-paper"
      >
        <div className="flex items-center gap-2 border-b border-agents-line px-3 py-2">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill={`#${icon.hex}`}>
            <path d={icon.path} />
          </svg>
          <span className="text-xs font-medium">{app}</span>
          <span className="truncate text-xs text-muted-foreground">{context}</span>
        </div>
        <div className="bg-surface">
          <div className="flex flex-col gap-1 p-3">
            <span className="truncate text-sm font-medium">{title}</span>
            <span className="truncate text-xs text-muted-foreground">{detail}</span>
          </div>
          <dl className="flex flex-col divide-y divide-agents-line border-t border-agents-line px-3">
            {fields.map((field) => (
              <div key={field.label} className="flex items-baseline justify-between gap-3 py-2">
                <dt className="truncate text-xs text-muted-foreground">{field.label}</dt>
                <dd className="font-mono text-xs whitespace-nowrap">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </li>
  );
}
