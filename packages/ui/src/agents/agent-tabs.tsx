"use client";

import { Tabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { type ReactNode, useCallback, useState } from "react";

import { cn } from "../lib/cn.ts";
import { TabProgress } from "./tab-progress.tsx";
import { useAutoAdvance } from "./use-auto-advance.ts";

export interface AgentTab {
  id: string;
  title: string;
  description: string;
  panel: ReactNode;
  /* A short mono line above the title, e.g. « Phase 01 ». */
  kicker?: string;
  /* What the step delivers, listed under its description in the « below » layout. */
  details?: readonly string[];
}

interface AgentTabsProps {
  items: AgentTab[];
  label: string;
  /* Milliseconds each agent stays on stage before the next. */
  every?: number;
  /* side: the stage on the left, the list on the right. below: one stage, the steps in columns underneath. */
  layout?: "side" | "below";
  className?: string;
}

const rootVariants = cva("grid grid-cols-1", {
  variants: {
    layout: {
      side: "gap-6 lg:grid-cols-12 lg:gap-10",
      below: "gap-0",
    },
  },
});

const stageVariants = cva("", {
  variants: { layout: { side: "lg:col-span-8", below: "" } },
});

const listVariants = cva("flex flex-col", {
  variants: {
    layout: {
      side: "lg:col-span-4",
      below: "md:grid md:grid-cols-3",
    },
  },
});

const tabVariants = cva(
  "group/tab relative flex cursor-pointer flex-col gap-2 border-t border-border text-start text-muted-foreground transition-colors duration-300 data-active:text-foreground",
  {
    variants: {
      layout: {
        side: "py-5",
        below: "gap-3 px-0 py-6 md:px-6 md:data-active:bg-surface/60",
      },
    },
  },
);

function TabText({ item, layout }: { item: AgentTab; layout: "side" | "below" }) {
  const always = layout === "below";
  return (
    <>
      {item.kicker === undefined ? null : (
        <span className="font-mono text-xs tracking-wide uppercase">{item.kicker}</span>
      )}
      <span className={cn("text-current", always ? "font-display text-2xl" : "text-xl")}>
        {item.title}
      </span>
      <span
        className={cn(
          "text-sm text-muted-foreground",
          always ? "block" : "hidden group-data-active/tab:block",
        )}
      >
        {item.description}
      </span>
      {always && item.details !== undefined ? (
        <span className="flex flex-col border-t border-border">
          {item.details.map((detail) => (
            <span key={detail} className="border-b border-border py-2 text-sm text-foreground">
              {detail}
            </span>
          ))}
        </span>
      ) : null}
    </>
  );
}

/* The agents one after the other, the way a product page walks its features: the stage on the left plays the
   active agent, the list on the right advances by itself with a progress bar, and stops under the pointer. */
export function AgentTabs({
  items,
  label,
  every = 9000,
  layout = "side",
  className,
}: AgentTabsProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const advance = useCallback(() => {
    setActive((active + 1) % items.length);
  }, [active, items.length]);
  const running = useAutoAdvance({ root, count: items.length, every, advance });

  return (
    <Tabs.Root
      ref={setRoot}
      data-slot="agent-tabs"
      value={active}
      onValueChange={(value) => {
        setActive(Number(value));
      }}
      className={cn(rootVariants({ layout }), className)}
    >
      <div className={stageVariants({ layout })}>
        {items.map((item, index) => (
          <Tabs.Panel key={item.id} value={index} keepMounted className="data-hidden:hidden">
            {item.panel}
          </Tabs.Panel>
        ))}
      </div>
      <Tabs.List aria-label={label} className={listVariants({ layout })}>
        {items.map((item, index) => (
          <Tabs.Tab key={item.id} value={index} className={tabVariants({ layout })}>
            <TabProgress
              key={`${String(index)}-${String(active)}`}
              active={index === active}
              running={running}
              duration={every}
            />
            <TabText item={item} layout={layout} />
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
