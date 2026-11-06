"use client";

import { Tabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { type ReactElement, type ReactNode, useCallback, useState } from "react";

import { cn } from "../lib/cn.ts";
import { TabProgress } from "./tab-progress.tsx";
import { useAutoAdvance } from "./use-auto-advance.ts";

export interface AgentTab {
  id: string;
  title: string;
  description: string;
  panel: ReactNode;
  /* A short fact that introduces a phase. */
  kicker?: string;
  details?: readonly string[];
}

interface AgentTabsProps {
  items: AgentTab[];
  label: string;
  /* Milliseconds each agent stays on stage in the side layout. */
  every?: number;
  /* Side presents a rotating showcase. Below puts manual phase controls above a shared stage. */
  layout?: "side" | "below";
  backdrop?: ReactElement;
  /* Driven from outside (the scroll): the phase to show. A tab chosen by the visitor wins until it changes. */
  active?: number | undefined;
  /* A bar under the whole row of phases, filled by the scroll (`[data-phase-rail]`, scaled by the page's
     choreography). It replaces the active underline from tablets up when motion is allowed. */
  rail?: boolean;
  className?: string;
}

const rootVariants = cva("grid grid-cols-1", {
  variants: {
    layout: {
      side: "w-full gap-6 lg:grid-cols-12 lg:gap-10",
      below: "w-full gap-4 md:gap-6",
    },
  },
});

const sideTab =
  "group/tab relative flex cursor-pointer flex-col gap-2 border-t border-border py-5 text-start text-muted-foreground transition-colors duration-300 data-active:text-foreground";

const phaseTab =
  "inline-flex cursor-pointer items-center py-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-active:text-foreground motion-reduce:transition-none sm:text-md";

type PhaseTravel = "forward" | "backward";

function phasePanels(items: AgentTab[], active: number, travel: PhaseTravel | undefined) {
  return items.map((item, index) => (
    <Tabs.Panel
      key={item.id}
      value={index}
      keepMounted
      data-phase-travel={index === active ? travel : undefined}
      className="col-start-1 row-start-1 grid min-w-0 agents-phase-panel md:grid-cols-12"
    >
      <div className="order-2 flex flex-col justify-center gap-4 border-t border-border bg-background p-5 md:order-0 md:col-span-5 md:border-e md:border-t-0 md:p-8 lg:p-10">
        {item.kicker === undefined ? null : (
          <p className="font-display text-2xl text-foreground lg:text-3xl">{item.kicker}</p>
        )}
        <p className="text-md text-muted-foreground">{item.description}</p>
        {item.details === undefined ? null : (
          <ul className="border-t border-border">
            {item.details.map((detail) => (
              <li key={detail} className="border-b border-border py-2 text-sm text-foreground">
                {detail}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div
        data-slot="agents-phase-board"
        className="flex min-w-0 items-center p-3 sm:p-6 md:col-span-7 lg:p-8"
      >
        <div className="w-full min-w-0">{item.panel}</div>
      </div>
    </Tabs.Panel>
  ));
}

function phaseSequence({
  items,
  label,
  backdrop,
  active,
  travel,
  rail,
}: {
  items: AgentTab[];
  label: string;
  backdrop: ReactElement | undefined;
  active: number;
  travel: PhaseTravel | undefined;
  rail: boolean;
}) {
  return (
    <>
      <Tabs.List
        aria-label={label}
        className={cn(
          "relative flex gap-6 border-b border-border sm:gap-10",
          /* With the rail, each phase owns a third of the row, so a third of the bar ends under it. */
          rail && "md:grid md:grid-cols-3 md:gap-0",
        )}
      >
        {items.map((item, index) => (
          <Tabs.Tab key={item.id} value={index} className={phaseTab}>
            {item.title}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator
          aria-hidden
          className={cn("agents-phase-indicator", rail && "md:motion-safe:hidden")}
        />
        {rail ? (
          <span
            aria-hidden
            data-phase-rail=""
            className="pointer-events-none absolute inset-x-0 -bottom-px hidden h-0.5 origin-left scale-x-0 bg-agents-signal md:motion-safe:block"
          />
        ) : null}
      </Tabs.List>
      <div className="relative isolate grid overflow-clip rounded-stage bg-muted">
        {backdrop === undefined ? null : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden md:inset-s-1/3 [&_img]:size-full [&_img]:object-cover"
          >
            {backdrop}
          </div>
        )}
        {phasePanels(items, active, travel)}
      </div>
    </>
  );
}

function agentShowcase({
  items,
  label,
  active,
  running,
  every,
}: {
  items: AgentTab[];
  label: string;
  active: number;
  running: boolean;
  every: number;
}) {
  return (
    <>
      <div className="lg:col-span-8">
        {items.map((item, index) => (
          <Tabs.Panel key={item.id} value={index} keepMounted className="data-hidden:hidden">
            {item.panel}
          </Tabs.Panel>
        ))}
      </div>
      <Tabs.List aria-label={label} className="flex flex-col lg:col-span-4">
        {items.map((item, index) => (
          <Tabs.Tab key={item.id} value={index} className={sideTab}>
            <TabProgress
              key={`${String(index)}-${String(active)}`}
              active={index === active}
              running={running}
              duration={every}
            />
            {item.kicker === undefined ? null : (
              <span className="font-mono text-xs tracking-wide uppercase">{item.kicker}</span>
            )}
            <span className="text-xl text-current">{item.title}</span>
            <span className="hidden text-sm text-muted-foreground group-data-active/tab:block">
              {item.description}
            </span>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </>
  );
}

/* The shown phase and the way it travelled there. A new phase from the scroll replaces the shown one; a tab the
   visitor picks wins until the scroll moves on. */
function usePhase(driven: number | undefined) {
  const [active, setActive] = useState(driven ?? 0);
  const [travel, setTravel] = useState<PhaseTravel>();
  const [lastDriven, setLastDriven] = useState(driven);
  const show = useCallback(
    (next: number) => {
      if (next !== active) {
        setTravel(next > active ? "forward" : "backward");
      }
      setActive(next);
    },
    [active],
  );
  if (driven !== undefined && driven !== lastDriven) {
    setLastDriven(driven);
    show(driven);
  }
  return { active, travel, show };
}

/* A rotating showcase or a manually selected sequence on a shared stage. */
export function AgentTabs({
  items,
  label,
  every = 9000,
  layout = "side",
  backdrop,
  active: driven,
  rail = false,
  className,
}: AgentTabsProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const { active, travel, show } = usePhase(driven);
  const isSequence = layout === "below";
  const advance = useCallback(() => {
    show((active + 1) % items.length);
  }, [active, items.length, show]);
  const running = useAutoAdvance({ root, count: isSequence ? 0 : items.length, every, advance });

  return (
    <Tabs.Root
      ref={isSequence ? undefined : setRoot}
      data-slot="agent-tabs"
      value={active}
      onValueChange={(value) => {
        show(Number(value));
      }}
      className={cn(rootVariants({ layout }), className)}
    >
      {isSequence
        ? phaseSequence({ items, label, backdrop, active, travel, rail })
        : agentShowcase({ items, label, active, running, every })}
    </Tabs.Root>
  );
}
