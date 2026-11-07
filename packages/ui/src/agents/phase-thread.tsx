"use client";

import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import { type ReactElement, useLayoutEffect, useRef } from "react";

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
  "font-display text-3xl transition-colors duration-300 motion-reduce:transition-none",
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

/* One phase on the thread: its dot, its title (the control), and once reached the segment down to the next dot. Every
   phase's words are in the page; only the current one shows them. */
function ThreadStep({ item, state, last, checked, onSelect }: ThreadStepProps) {
  const deliverables = item.details?.length ?? 0;
  const ticked = state === "done" ? deliverables : checked;
  return (
    <li aria-current={state === "active" ? "step" : undefined} className="relative flex gap-4 py-3">
      {last ? null : (
        <span aria-hidden className="absolute agents-thread-segment w-px overflow-clip bg-border">
          <span
            className="block size-full origin-top bg-agents-signal transition-transform duration-300 motion-reduce:transition-none"
            style={{ scale: `1 ${String(threadFill(state, checked, deliverables))}` }}
          />
        </span>
      )}
      <span className="flex h-10 items-center">
        <Dot state={state} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h3>
          <button
            type="button"
            onClick={onSelect}
            aria-expanded={state === "active"}
            className="flex h-10 cursor-pointer items-center rounded-control text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className={titleVariants({ state })}>{item.title}</span>
          </button>
        </h3>
        <div
          hidden={state !== "active"}
          className="flex flex-col gap-4 motion-safe:animate-agents-phase-slide"
        >
          {item.kicker === undefined ? null : (
            <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {item.kicker}
            </span>
          )}
          <p className="text-md text-muted-foreground">{item.description}</p>
          {item.details === undefined ? null : (
            <Deliverables details={item.details} checked={ticked} />
          )}
        </div>
      </div>
    </li>
  );
}

/* One photographed surface; every phase's board laid on it, only the current one shown. */
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
    <PhotoStage
      padding="md"
      width="narrow"
      backdrop={backdrop}
      className="md:col-span-7 lg:col-span-8"
    >
      <div className="grid">
        {items.map((item, index) => (
          <div
            key={item.id}
            /* A waiting board keeps its place, so the stage never resizes, but leaves focus, the reading order and
               the layout audit (an aria-hidden layer out of the tab order). */
            aria-hidden={index === active ? undefined : true}
            tabIndex={index === active ? undefined : -1}
            inert={index !== active}
            className={cn(
              "col-start-1 row-start-1 flex min-w-0 items-center transition-opacity duration-300 motion-reduce:transition-none",
              index === active ? "opacity-100" : "invisible opacity-0",
            )}
          >
            <div className="w-full min-w-0">{item.panel}</div>
          </div>
        ))}
      </div>
    </PhotoStage>
  );
}

/* Where a phase's title sits in the window. */
function titleTop(list: HTMLOListElement | null, index: number) {
  return list?.children.item(index)?.querySelector("button")?.getBoundingClientRect().top;
}

/* Keeps the title the visitor picked under their finger while the phase above it folds. */
function useSteadyPick(active: number) {
  const list = useRef<HTMLOListElement>(null);
  const picked = useRef<{ index: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const pick = picked.current;
    picked.current = null;
    if (pick?.index !== active) {
      return;
    }
    const top = titleTop(list.current, active);
    if (top !== undefined && top !== pick.top) {
      window.scrollBy(0, top - pick.top);
    }
  }, [active]);
  function remember(index: number) {
    const top = titleTop(list.current, index);
    picked.current = top === undefined ? null : { index, top };
    /* A pick the page answers later (by scrolling to it) is not one to hold. */
    requestAnimationFrame(() => {
      picked.current = null;
    });
  }
  return { list, remember };
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
  const { list, remember } = useSteadyPick(active);
  return (
    <div
      data-slot="phase-thread"
      className="grid w-full grid-cols-1 gap-8 md:grid-cols-12 md:items-center md:gap-10"
    >
      <ol ref={list} aria-label={label} className="flex flex-col md:col-span-5 lg:col-span-4">
        {items.map((item, index) => (
          <ThreadStep
            key={item.id}
            item={item}
            state={stateOf(index, active)}
            last={index === items.length - 1}
            checked={checked}
            onSelect={() => {
              remember(index);
              onSelect(index);
            }}
          />
        ))}
      </ol>
      <ThreadStage items={items} active={active} backdrop={backdrop} />
    </div>
  );
}
