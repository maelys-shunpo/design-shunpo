"use client";

import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type { ReactElement } from "react";

import { cn } from "../lib/cn.ts";
import type { AgentTab } from "./agent-tabs.tsx";
import { PhotoStage } from "./photo-stage.tsx";

type StepState = "done" | "active" | "next";

const dotVariants = cva(
  "relative z-10 grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 motion-reduce:transition-none",
  {
    variants: {
      state: {
        done: "border-foreground bg-foreground text-background",
        active: "border-agents-signal bg-background",
        next: "border-border bg-background",
      },
    },
  },
);

const titleVariants = cva(
  "font-display text-2xl transition-colors duration-300 motion-reduce:transition-none",
  {
    variants: {
      state: {
        done: "text-foreground",
        active: "text-foreground",
        next: "text-muted-foreground",
      },
    },
  },
);

function stateOf(index: number, active: number): StepState {
  if (index < active) {
    return "done";
  }
  return index === active ? "active" : "next";
}

/* How much of the segment under a phase is drawn: full once passed, a share per ticked deliverable while it plays. */
function threadFill(state: StepState, checked: number, deliverables: number) {
  if (state === "done") {
    return 1;
  }
  if (state === "next" || deliverables === 0) {
    return 0;
  }
  return Math.min(1, checked / deliverables);
}

function Dot({ state }: { state: StepState }) {
  return (
    <span aria-hidden className={dotVariants({ state })}>
      {state === "done" ? <Check className="size-3" /> : null}
      {state === "active" ? <span className="size-2 rounded-full bg-agents-signal" /> : null}
    </span>
  );
}

/* What a phase delivers, ticked one by one as the visitor reads on. */
function Deliverables({ details, checked }: { details: readonly string[]; checked: number }) {
  return (
    <ul className="flex flex-col border-t border-border">
      {details.map((detail, index) => {
        const done = index < checked;
        return (
          <li
            key={detail}
            className={cn(
              "flex items-center gap-3 border-b border-border py-2 text-sm transition-colors duration-300 motion-reduce:transition-none",
              done ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-300 motion-reduce:transition-none",
                done ? "border-foreground bg-foreground text-background" : "border-border",
              )}
            >
              {done ? <Check className="size-2" /> : null}
            </span>
            {detail}
          </li>
        );
      })}
    </ul>
  );
}

interface ThreadStepProps {
  item: AgentTab;
  state: StepState;
  last: boolean;
  checked: number;
  onSelect: () => void;
}

/* One phase on the thread: its dot, its title (the control), and once reached the segment down to the next dot. */
function ThreadStep({ item, state, last, checked, onSelect }: ThreadStepProps) {
  return (
    <li aria-current={state === "active" ? "step" : undefined} className="relative flex gap-4 py-3">
      {last ? null : (
        <span aria-hidden className="absolute agents-thread-segment w-px overflow-clip bg-border">
          <span
            className="block size-full origin-top bg-agents-signal transition-transform duration-300 motion-reduce:transition-none"
            style={{ scale: `1 ${String(threadFill(state, checked, item.details?.length ?? 0))}` }}
          />
        </span>
      )}
      <span className="flex h-10 items-center">
        <Dot state={state} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="flex h-10 cursor-pointer items-center rounded-control text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className={titleVariants({ state })}>{item.title}</span>
        </button>
        {state === "active" ? (
          <div className="flex flex-col gap-4 motion-safe:animate-agents-phase-slide">
            {item.kicker === undefined ? null : (
              <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {item.kicker}
              </span>
            )}
            <p className="text-md text-muted-foreground">{item.description}</p>
            {item.details === undefined ? null : (
              <Deliverables details={item.details} checked={checked} />
            )}
          </div>
        ) : null}
      </div>
    </li>
  );
}

/* Every phase's board on one stage, only the current one shown. */
function ThreadStage({
  items,
  active,
  backdrop,
}: {
  items: AgentTab[];
  active: number;
  backdrop: ReactElement;
}) {
  return (
    <div className="grid md:col-span-7 lg:col-span-8">
      {items.map((item, index) => (
        <div
          key={item.id}
          /* A waiting board keeps its place, so the stage never resizes, but leaves focus, the reading order and
             the layout audit (an aria-hidden layer out of the tab order). */
          aria-hidden={index === active ? undefined : true}
          tabIndex={index === active ? undefined : -1}
          inert={index !== active}
          className={cn(
            "col-start-1 row-start-1 grid min-w-0 transition-opacity duration-300 motion-reduce:transition-none",
            index === active ? "opacity-100" : "invisible opacity-0",
          )}
        >
          <PhotoStage padding="md" width="narrow" backdrop={backdrop}>
            {item.panel}
          </PhotoStage>
        </div>
      ))}
    </div>
  );
}

interface PhaseThreadProps {
  items: AgentTab[];
  /* The phase shown, and how many of its deliverables are ticked. Driven by the scroll, or by a click. */
  active: number;
  checked: number;
  label: string;
  backdrop: ReactElement;
  onSelect: (index: number) => void;
}

/* The phases as an agent's plan: a thread runs from dot to dot, past steps ticked and folded, the current one open
   with its deliverables ticking and the thread drawn down as they tick, the next ones waiting. The stage beside shows
   the current phase. */
export function PhaseThread({
  items,
  active,
  checked,
  label,
  backdrop,
  onSelect,
}: PhaseThreadProps) {
  return (
    <div
      data-slot="phase-thread"
      className="grid w-full grid-cols-1 gap-8 md:grid-cols-12 md:items-center md:gap-10"
    >
      <ol aria-label={label} className="flex flex-col md:col-span-5 lg:col-span-4">
        {items.map((item, index) => (
          <ThreadStep
            key={item.id}
            item={item}
            state={stateOf(index, active)}
            last={index === items.length - 1}
            checked={checked}
            onSelect={() => {
              onSelect(index);
            }}
          />
        ))}
      </ol>
      <ThreadStage items={items} active={active} backdrop={backdrop} />
    </div>
  );
}
