"use client";

import { type ReactElement, type ReactNode, useMemo, useState } from "react";

import { GridArea } from "../layout/grid-area.tsx";
import { PageGrid } from "../layout/page-grid.tsx";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { Text } from "../typography/text.tsx";
import { Eyebrow } from "./eyebrow.tsx";
import { weekChoreography } from "./hero-semaine-choreography.ts";
import { HeroSemaineHeadline, type WeekHeadline } from "./hero-semaine-headline.tsx";
import { WeekWindow, type WeekWindowProps } from "./hero-semaine-window.tsx";

interface HeroSemaineProps {
  eyebrow: string;
  headline: WeekHeadline;
  lead: string;
  actions: ReactNode;
  /* A next/image with `fill`: the photographed wall the agenda rests on; its light drifts as the week passes. */
  backdrop: ReactElement;
  calendar: WeekWindowProps["calendar"];
  tasks: WeekWindowProps["tasks"];
  journal: WeekWindowProps["journal"];
}

/* Hero « La semaine rendue »: a full working week on a sunlit wall, beside the promise. Held for three screens from
   tablets up, the agent's ink cursor sweeps it from Monday to Friday while the light drifts; each routine is ticked,
   lands in the agent's journal and leaves its slot free, until only people's time is left, and the headline's last
   word turns from the week to time. Phones and reduced motion read the week ticked, its slots free, the journal
   complete. */
export function HeroSemaine({
  eyebrow,
  headline,
  lead,
  actions,
  backdrop,
  calendar,
  tasks,
  journal,
}: HeroSemaineProps) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const choreography = useMemo(() => weekChoreography(tasks, root), [tasks, root]);
  return (
    <section ref={setRoot} data-slot="hero-semaine">
      <ScrollScene choreography={choreography} length="long" minWidth="md" below="header">
        <div className="flex w-full flex-col gap-6 self-stretch md:motion-safe:py-4 lg:motion-safe:py-6">
          <PageGrid rows="sm">
            <GridArea overflow="visible">
              <div className="flex flex-col gap-4">
                <Eyebrow>{eyebrow}</Eyebrow>
                <HeroSemaineHeadline headline={headline} />
              </div>
            </GridArea>
            <GridArea>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
                <Text size="lg" tone="muted">
                  {lead}
                </Text>
                <div className="shrink-0">{actions}</div>
              </div>
            </GridArea>
          </PageGrid>
          {/* Held, the week fills what the copy leaves of the stage: the frame below is sized by the stage. */}
          <div className="relative md:motion-safe:min-h-0 md:motion-safe:flex-1">
            <PageGrid align="stretch" className="md:motion-safe:absolute md:motion-safe:inset-0">
              <GridArea className="min-h-0">
                <WeekWindow
                  backdrop={backdrop}
                  calendar={calendar}
                  tasks={tasks}
                  journal={journal}
                />
              </GridArea>
            </PageGrid>
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}
