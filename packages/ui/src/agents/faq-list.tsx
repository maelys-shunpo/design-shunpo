import type { ReactNode } from "react";

import { GridArea } from "../layout/grid-area.tsx";
import { PageGrid } from "../layout/page-grid.tsx";
import { Stack } from "../layout/stack.tsx";
import { Arrival } from "./arrival.tsx";
import { FaqItem } from "./faq-item.tsx";
import { Headline } from "./headline.tsx";

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

interface FaqListProps {
  /* The heading over the list, passed by the page so no page copy lives here. */
  title: ReactNode;
  items: FaqEntry[];
  className?: string | undefined;
}

/* The FAQ, read whole: the title on five columns, the answers from the seventh, one empty column between.
   The outer Section stays with the page; this inner block is shared by the readable section and the coupe scene. */
export function FaqList({ title, items, className }: FaqListProps) {
  return (
    <PageGrid data-slot="faq-list" rows="lg" className={className}>
      <GridArea columns={{ lg: { start: 1, span: 5 } }}>
        <Stack gap="lg">
          <Headline level={2} size="heading" entrance="lines">
            {title}
          </Headline>
        </Stack>
      </GridArea>
      <GridArea columns={{ lg: { start: 7, span: 6 } }}>
        <Arrival mode="block">
          {items.map((item) => (
            <FaqItem key={item.id} question={item.question} answer={item.answer} />
          ))}
        </Arrival>
      </GridArea>
    </PageGrid>
  );
}
