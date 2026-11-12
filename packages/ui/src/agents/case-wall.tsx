"use client";

import { type ReactElement, type ReactNode, useState } from "react";

import { Container } from "../layout/container.tsx";
import { useArrival } from "./use-arrival.ts";

interface CaseWallProps {
  /* The section's title above the wall. */
  title: ReactElement;
  /* CaseCard elements: each in its own list item. */
  items: ReactNode[];
  label: string;
  /* The way to every project, under the wall (an `AgentsAction`). */
  action: ReactNode;
}

/* The references wall, a gallery at night: the title, three cards, the way to all the projects. Phones read a stacked
   list. From tablets up the cards stand on an arc (the middle one a step higher); with motion they arrive on a curve
   and settle onto it once, as the wall comes into view (`data-arrival`, `agents-wall-slot`). Reduced motion paints the
   arc at once. Nothing on it moves again: the pointer only folds a card's corner. */
export function CaseWall({ title, items, label, action }: CaseWallProps) {
  const [list, setList] = useState<HTMLUListElement | null>(null);
  const arrived = useArrival(list);
  return (
    <div data-slot="case-wall" className="flex w-full flex-col items-center gap-12 py-6">
      <Container>{title}</Container>
      <ul
        ref={setList}
        aria-label={label}
        data-arrival={arrived ? "arrived" : "waiting"}
        className="grid w-full grid-cols-1 gap-4 px-5 md:flex md:items-start md:justify-center md:gap-4 md:px-0 lg:gap-8"
      >
        {items.map((item, index) => (
          <li
            // oxlint-disable-next-line react/no-array-index-key -- cards are positional slots on the arc.
            key={index}
            data-wall-slot
            className="agents-wall-slot md:flex-none md:agents-wall-card"
          >
            {item}
          </li>
        ))}
      </ul>
      {action}
    </div>
  );
}
