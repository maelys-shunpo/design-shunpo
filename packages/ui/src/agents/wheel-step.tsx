import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { GridArea } from "../layout/grid-area.tsx";
import { cn } from "../lib/cn.ts";
import { Text } from "../typography/text.tsx";
import { Headline } from "./headline.tsx";

/* One phase of the method: its copy, what it delivers, the kanji that names it and its still. */
export interface WheelPhase {
  id: string;
  /* A few plain words above the title (« 5 jours auprès de vos équipes »). */
  label: string;
  title: string;
  text: string;
  /* What the phase leaves you with, ticked one by one as the wheel plays. */
  deliverables: readonly string[];
  /* One kanji naming the phase (見, 築, 進), set large and pale behind its still. */
  kanji: string;
  /* The phase's still, cut out on the page's paper: a next/image with `fill`, kept whole in its square. */
  panel: ReactNode;
}

/* Phones: the still above its copy (its object stands on the frame's ground line, so the empty top parts it from the
   phase before). Tablets up: the copy on the left (the wheel's dot rests beside it), the still on
   the right. */
const stepVariants = cva("grid-page items-center gap-y-8");

const deliverableVariants = cva(
  "group flex items-center gap-3 border-b border-border py-2 text-sm text-foreground transition-colors duration-300 md:motion-safe:data-pending:text-muted-foreground",
);

const tickVariants = cva(
  "grid size-4 shrink-0 place-items-center rounded-full border border-foreground bg-foreground text-background transition-colors duration-300 md:motion-safe:group-data-pending:border-border md:motion-safe:group-data-pending:bg-transparent",
);

/* The phase's words and deliverables, each part uncovered in its turn. */
function WheelCopy({ phase }: { phase: WheelPhase }) {
  return (
    <div data-wheel-copy className="flex flex-col items-start gap-4">
      <Text as="span" size="sm" weight="medium" tone="muted">
        {phase.label}
      </Text>
      <Headline level={3} size="subtitle" className="lg:text-4xl">
        {phase.title}
      </Headline>
      <Text tone="muted" measure="prose">
        {phase.text}
      </Text>
      <ul className="flex w-full flex-col border-t border-border">
        {phase.deliverables.map((deliverable) => (
          <li key={deliverable} data-wheel-deliverable className={deliverableVariants()}>
            <span aria-hidden className={tickVariants()}>
              <Check className="size-2 md:motion-safe:group-data-pending:opacity-0" />
            </span>
            {deliverable}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Where a phase's still sits from tablets up, and the wheel's film over it. */
export const PANEL_COLUMNS = { md: { start: 5, span: 4 }, lg: { start: 8, span: 5 } } as const;

interface WheelStepProps {
  phase: WheelPhase;
  className?: string;
}

/* One phase of the method wheel (internal to `MethodWheel`). Its copy carries `data-wheel-copy` (the wheel's dot rests
   beside it), each deliverable `data-wheel-deliverable` (ticked by
   the wheel's course: a pending one is grey with an empty circle). Held, the wheel marks the current phase
   `data-wheel-active`. Phones and reduced motion read every phase complete, each with its still. */
export function WheelStep({ phase, className }: WheelStepProps) {
  return (
    <li data-slot="wheel-step" className={cn(stepVariants(), className)}>
      <GridArea
        columns={{ md: { start: 2, span: 3 }, lg: { start: 3, span: 4 } }}
        align="center"
        overflow="visible"
        className="agents-wheel-copy agents-wheel-slide"
      >
        <WheelCopy phase={phase} />
      </GridArea>
      <GridArea
        columns={PANEL_COLUMNS}
        align="center"
        overflow="visible"
        className="relative order-first md:order-0"
      >
        <span
          lang="ja"
          aria-hidden="true"
          className="pointer-events-none absolute agents-wheel-kanji -z-10 hidden agents-wheel-slide font-mincho font-medium text-agents-kanji select-none md:block"
        >
          {phase.kanji}
        </span>
        <div className="agents-wheel-panel relative aspect-square w-full *:object-contain">
          {phase.panel}
        </div>
      </GridArea>
    </li>
  );
}
