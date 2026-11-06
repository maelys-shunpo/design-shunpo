"use client";

import { lazy, type ReactNode, useState } from "react";

import { AfterIdle } from "../motion/after-idle.tsx";

const LazyCaseRingMotion = lazy(async () => {
  const { CaseRingMotion } = await import("./case-ring-motion.tsx");
  return { default: CaseRingMotion };
});

interface CaseRingProps {
  /* CaseCard elements, each in its own list item. */
  items: ReactNode[];
  label: string;
}

/* The references on the inside of a curved wall: a row of cards on wide screens and a list on phones; with
   motion, the wall bends around the visitor and turns as they scroll past it. */
export function CaseRing({ items, label }: CaseRingProps) {
  const [ring, setRing] = useState<HTMLUListElement | null>(null);
  return (
    <div data-slot="case-ring" className="overflow-clip py-6">
      <ul
        ref={setRing}
        aria-label={label}
        className="grid grid-cols-1 gap-4 transform-3d sm:grid-cols-2 md:grid-cols-5 md:gap-6"
      >
        {items.map((item, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- cards are positional slots on the curve.
          <li key={index} data-ring-card className="backface-hidden">
            {item}
          </li>
        ))}
      </ul>
      <AfterIdle>
        <LazyCaseRingMotion ring={ring} />
      </AfterIdle>
    </div>
  );
}
