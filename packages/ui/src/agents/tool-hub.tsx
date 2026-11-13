"use client";

import { Pause, Play } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Shuriken } from "../brand/shuriken.tsx";
import { cn } from "../lib/cn.ts";
import {
  computeHubLayout,
  DESK_GEOMETRY,
  type HubLayout,
  PHONE_GEOMETRY,
  type HubTile,
  type ToolMark,
} from "./tool-hub-layout.ts";

declare module "react" {
  interface CSSProperties {
    /* A tool's centre and the shares a tile, a logo and a name take of the box (`agents-hub-*`), set on the figure so
       every tool scales with it; a tile's float offset; a flow's run and stagger; the octagon stroke's length. */
    "--hub-x"?: string;
    "--hub-y"?: string;
    "--hub-tile"?: string;
    "--hub-logo"?: string;
    "--hub-name"?: string;
    "--hub-seal"?: string;
    "--hub-flow-dur"?: string;
    "--hub-flow-delay"?: string;
    "--hub-float-delay"?: string;
    "--hub-draw"?: string;
  }
}

/* The name shown under 14 px, in design pixels, kept legible as the box shrinks. */
const NAME_SIZE = 14;

/* A column of tools, top to bottom, as many as the layout's rows. */
export interface ToolColumns {
  left: readonly ToolMark[];
  right: readonly ToolMark[];
}

/* One tool: its cut tile and sharp logo, floating a few pixels; the owner's own software is a dashed, empty slot. The
   name sits outside the tile — beside it on the wide layout, under it on phones — read at all times. */
function HubToolTile({ tile, index }: { tile: HubTile; index: number }) {
  const { mark, side } = tile;
  const yours = mark.yours === true;
  return (
    <div
      data-slot="hub-tool"
      data-side={side}
      className="agents-hub-tool"
      style={{ "--hub-x": `${String(tile.xPercent)}%`, "--hub-y": `${String(tile.yPercent)}%` }}
    >
      <div
        className="agents-hub-float"
        style={{ "--hub-float-delay": `${String((-index * 1.37) % 9)}s` }}
      >
        <div
          data-slot="hub-tile"
          className={cn(
            "agents-hub-tile",
            yours ? "agents-hub-slot" : "agents-sheet agents-sheet-lift agents-sheet-2xs",
          )}
        >
          {yours ? null : (
            <svg aria-hidden viewBox="0 0 24 24" className="agents-hub-logo" fill={`#${mark.hex}`}>
              <path d={mark.path} />
            </svg>
          )}
        </div>
        <span className="agents-hub-name">{mark.title}</span>
      </div>
    </div>
  );
}

/* The wires and the octagon as one SVG that scales with its view box: the faint ring, the ink stroke that draws it,
   every wire, and a flowing head and trail on each live wire. Read as one picture (`aria-hidden`). */
function HubWires({ layout }: { layout: HubLayout }) {
  return (
    // The wires and octagon, one SVG scaling with the box; the stroke caps shown so none is clipped at the edge.
    <svg
      aria-hidden
      className="absolute inset-0 size-full overflow-visible"
      viewBox={layout.viewBox}
      fill="none"
    >
      <path className="agents-hub-ring" d={layout.octagon} />
      <path
        className="agents-hub-draw"
        d={layout.draw}
        style={{ "--hub-draw": `${String(layout.drawLength)}px` }}
        strokeDasharray={layout.drawLength}
      />
      {layout.wires.map((wire) => (
        <path
          key={wire.slug}
          className={cn("agents-hub-wire", wire.pending && "agents-hub-wire-pending")}
          d={wire.d}
        />
      ))}
      {layout.wires
        .filter((wire) => !wire.pending)
        .map((wire) => (
          <g
            key={wire.slug}
            style={{
              "--hub-flow-dur": `${String(wire.duration)}s`,
              "--hub-flow-delay": `${String(wire.delay)}s`,
            }}
          >
            <path className="agents-hub-flow-tail" d={wire.d} />
            <path className="agents-hub-flow-head" d={wire.d} />
          </g>
        ))}
    </svg>
  );
}

/* One layout of the hub: the wires and octagon, the seal and its label over the centre, and the tools placed by their
   shares. The figure is named; the tool names carry the text. */
function HubFigure({
  layout,
  label,
  sealLabel,
  className,
}: {
  layout: HubLayout;
  label: string;
  sealLabel: string;
  className: string;
}) {
  return (
    <figure
      aria-label={label}
      className={cn("agents-hub", className)}
      style={{
        "--hub-tile": `${String(layout.tilePercent)}cqw`,
        "--hub-logo": `${String(layout.logoPercent)}cqw`,
        "--hub-name": `max(0.75rem, ${String((NAME_SIZE / layout.width) * 100)}cqw)`,
        "--hub-seal": `${String(layout.sealWidthPercent)}cqw`,
      }}
    >
      <HubWires layout={layout} />
      <div
        className="agents-hub-seal"
        style={{ left: `${String(layout.sealXPercent)}%`, top: `${String(layout.sealYPercent)}%` }}
      >
        <Shuriken tone="signal" className="size-full" />
      </div>
      <figcaption
        className="agents-hub-seal-label"
        style={{
          left: `${String(layout.labelXPercent)}%`,
          top: `${String(layout.labelYPercent)}%`,
        }}
      >
        {sealLabel}
      </figcaption>
      {layout.tiles.map((tile, index) => (
        <HubToolTile key={tile.mark.slug} tile={tile} index={index} />
      ))}
    </figure>
  );
}

/* Stops and starts the continuous flows (WCAG 2.2.2); gone under reduced motion, where nothing moves to stop. */
function HubControl({
  paused,
  labels,
  onToggle,
}: {
  paused: boolean;
  labels: { pause: string; play: string };
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={paused ? labels.play : labels.pause}
      className="absolute right-0 bottom-0 agents-hub-pause size-8 cursor-pointer rounded-full border border-agents-line bg-surface text-agents-ink transition-colors hover:border-agents-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {paused ? <Play aria-hidden className="size-3" /> : <Pause aria-hidden className="size-3" />}
    </button>
  );
}

interface ToolHubProps {
  /* The copy over the hub: the section's title and its one line. */
  children: ReactNode;
  /* The wide layout's two columns, six tools each; the owner's own `yours` last on the right. */
  desk: ToolColumns;
  /* The phone layout's two columns, four tools each; the owner's own `yours` last on the right. */
  phone: ToolColumns;
  /* Names the diagram for readers. */
  label: string;
  /* The label under the seal, naming what it stands for. */
  sealLabel: string;
  /* Names the control that stops and starts the flows. */
  labels: { pause: string; play: string };
  className?: string | undefined;
}

/* The copy over an octagon holding the SHUNPO seal, the tools cut from the sheet down two symmetric arcs, and a beam
   of 45°-chamfered wires running each tool into the ring. Each tool sends a continuous flow of ink into the centre;
   the octagon is drawn on in ink, then wiped off, in a slow sweep; the tools float a few pixels. The owner's own
   software waits as a dashed slot on a dashed wire, with no flow, until a connector is built. A control stops the
   flows; off screen and under reduced motion everything is still, the composition whole. The wide layout shows from
   `lg`, the phone layout below it. */
export function ToolHub({
  children,
  desk,
  phone,
  label,
  sealLabel,
  labels,
  className,
}: ToolHubProps) {
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    const observer = new IntersectionObserver((entries) => {
      setVisible(entries[0]?.isIntersecting ?? true);
    });
    if (node !== null) {
      observer.observe(node);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  const deskLayout = computeHubLayout(DESK_GEOMETRY, desk.left, desk.right);
  const phoneLayout = computeHubLayout(PHONE_GEOMETRY, phone.left, phone.right);

  return (
    <div
      ref={rootRef}
      data-slot="tool-hub"
      className={cn(
        "agents-hub-root w-full",
        (paused || !visible) && "agents-hub-still",
        className,
      )}
    >
      <div className="z-10 w-full">{children}</div>
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <HubFigure
          layout={deskLayout}
          label={label}
          sealLabel={sealLabel}
          className="hidden lg:block"
        />
        <HubFigure layout={phoneLayout} label={label} sealLabel={sealLabel} className="lg:hidden" />
        <HubControl
          paused={paused}
          labels={labels}
          onToggle={() => {
            setPaused((value) => !value);
          }}
        />
      </div>
    </div>
  );
}
