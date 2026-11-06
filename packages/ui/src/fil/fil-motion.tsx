"use client";

import { lazy, type ReactNode, useRef } from "react";

import { AfterIdle } from "../motion/after-idle.tsx";

const LazyFilMotionRuntime = lazy(async () => {
  const { FilMotionRuntime } = await import("./fil-motion-runtime.tsx");
  return { default: FilMotionRuntime };
});

interface FilMotionProps {
  children: ReactNode;
}

/* The motion of the « Le fil » page outside its held scene: the red thread drawn through each band as it is read,
   headlines rising out of their lines, strikes and rails drawn as they enter, the craft cards settling under each
   other. It loads once the page is idle; until then, and under reduced motion, the page shows its final state. */
export function FilMotion({ children }: FilMotionProps) {
  const scope = useRef<HTMLDivElement>(null);
  return (
    <div ref={scope} data-slot="fil-motion" className="contents">
      {children}
      <AfterIdle>
        <LazyFilMotionRuntime scope={scope} />
      </AfterIdle>
    </div>
  );
}
