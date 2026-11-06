"use client";

import { Tabs } from "@base-ui/react/tabs";
import { type ReactNode, useCallback, useState } from "react";

import { cn } from "../lib/cn.ts";
import { TabProgress } from "./tab-progress.tsx";
import { useAutoAdvance } from "./use-auto-advance.ts";

export interface AgentTab {
  id: string;
  title: string;
  description: string;
  panel: ReactNode;
}

interface AgentTabsProps {
  items: AgentTab[];
  label: string;
  /* Milliseconds each agent stays on stage before the next. */
  every?: number;
  className?: string;
}

/* The agents one after the other, the way a product page walks its features: the stage on the left plays the
   active agent, the list on the right advances by itself with a progress bar, and stops under the pointer. */
export function AgentTabs({ items, label, every = 9000, className }: AgentTabsProps) {
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
      className={cn("grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10", className)}
    >
      <div className="lg:col-span-8">
        {items.map((item, index) => (
          <Tabs.Panel key={item.id} value={index} keepMounted className="data-hidden:hidden">
            {item.panel}
          </Tabs.Panel>
        ))}
      </div>
      <Tabs.List aria-label={label} className="flex flex-col lg:col-span-4">
        {items.map((item, index) => (
          <Tabs.Tab
            key={item.id}
            value={index}
            className="group/tab relative flex cursor-pointer flex-col gap-2 border-t border-border py-5 text-start text-muted-foreground transition-colors duration-300 data-active:text-foreground"
          >
            <TabProgress
              key={`${String(index)}-${String(active)}`}
              active={index === active}
              running={running}
              duration={every}
            />
            <span className="text-xl text-current">{item.title}</span>
            <span className="hidden text-sm text-muted-foreground group-data-active/tab:block">
              {item.description}
            </span>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
