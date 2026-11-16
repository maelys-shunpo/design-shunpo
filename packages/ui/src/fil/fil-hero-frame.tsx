import type { ReactNode } from "react";

import { cn } from "../lib/cn.ts";

interface FilHeroFrameProps {
  children: ReactNode;
  foot: ReactNode;
  className?: string;
}

/* The copy of the first window over the threads: the message centred in the space under the header, the
   chapters of the scene at the foot. */
export function FilHeroFrame({ children, foot, className }: FilHeroFrameProps) {
  return (
    <div
      data-slot="fil-hero-frame"
      className={cn(
        "mx-auto flex size-full max-w-wide flex-col gap-8 px-5 py-6 md:p-10",
        className,
      )}
    >
      <div className="flex flex-1 items-end md:items-center">
        <div className="flex max-w-narrow flex-col gap-8" data-fil-hero-copy>
          {children}
        </div>
      </div>
      {foot}
    </div>
  );
}
