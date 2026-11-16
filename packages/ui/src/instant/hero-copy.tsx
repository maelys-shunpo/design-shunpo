import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

interface HeroCopyProps {
  /* Kicker, title and actions: the offer, readable before anything moves. */
  intro: ReactNode;
  /* The lead paragraph: in portrait the drawing takes the upper half, so the lead waits for the next section. */
  lead?: ReactNode;
  /* The caption of the drawing in view, at the foot of the column. */
  captions: ReactNode;
  className?: string;
}

/* The copy of the Instant hero, laid over the paper: a column left of the drawing in landscape, the lower half
   under it in portrait. The column hugs the left margin, so the stage's pause control, bottom right, stays free. */
export function HeroCopy({ intro, lead, captions, className }: HeroCopyProps) {
  return (
    <div
      data-slot="hero-copy"
      className={cn("grid size-full px-6 py-8 md:px-12 lg:px-20 landscape:py-24", className)}
    >
      <div className="grid h-full content-end gap-6 landscape:w-5/12 landscape:content-between landscape:gap-8">
        <div className="grid gap-4 landscape:gap-6">
          {intro}
          {lead === undefined ? null : <div className="portrait:hidden">{lead}</div>}
        </div>
        {captions}
      </div>
    </div>
  );
}
