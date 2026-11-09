import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import { GridArea } from "../layout/grid-area.tsx";
import { cn } from "../lib/cn.ts";
import { Text } from "../typography/text.tsx";
import { Headline } from "./headline.tsx";
import { PhotoStage } from "./photo-stage.tsx";

declare module "react" {
  interface CSSProperties {
    /* WheelStep: the order a part of the copy is uncovered in when its phase comes in. */
    "--wheel-line"?: string;
  }
}

/* One phase of the method: its copy, what it delivers, the kanji that names it and its board. */
export interface WheelPhase {
  id: string;
  /* A few plain words above the title (« 5 jours auprès de vos équipes »). */
  label: string;
  title: string;
  text: string;
  /* What the phase leaves you with, ticked one by one as the wheel plays. */
  deliverables: readonly string[];
  /* One kanji naming the phase (見, 築, 進), set large and pale behind its board. */
  kanji: string;
  /* The phase's board, laid on the photographed surface. */
  panel: ReactNode;
}

/* Phones: the copy above its board. Tablets up: the copy on the left (the wheel's dot rests beside it), the board on
   the right. */
const stepVariants = cva("grid-page items-center gap-y-8");

const deliverableVariants = cva(
  "group flex items-center gap-3 border-b border-border py-2 text-sm text-foreground transition-colors duration-300 md:motion-safe:data-pending:text-muted-foreground",
);

const tickVariants = cva(
  "grid size-4 shrink-0 place-items-center rounded-full border border-foreground bg-foreground text-background transition-colors duration-300 md:motion-safe:group-data-pending:border-border md:motion-safe:group-data-pending:bg-transparent",
);

function line(order: number) {
  return { "--wheel-line": String(order) };
}

/* The phase's words and deliverables, each part uncovered in its turn. */
function WheelCopy({ phase }: { phase: WheelPhase }) {
  return (
    <div data-wheel-copy className="flex flex-col items-start gap-4">
      <Text
        as="span"
        size="sm"
        weight="medium"
        tone="muted"
        className="agents-wheel-line"
        style={line(0)}
      >
        {phase.label}
      </Text>
      <Headline level={3} size="subtitle" className="agents-wheel-line lg:text-4xl" style={line(1)}>
        {phase.title}
      </Headline>
      <Text tone="muted" measure="prose" className="agents-wheel-line" style={line(2)}>
        {phase.text}
      </Text>
      <ul className="flex w-full flex-col border-t border-border agents-wheel-line" style={line(3)}>
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

interface WheelStepProps {
  phase: WheelPhase;
  /* A next/image with `fill`: the photographed surface the board rests on. */
  backdrop: ReactElement;
  className?: string;
}

/* One phase of the method wheel (internal to `MethodWheel`). Its copy carries `data-wheel-copy` (the wheel's dot rests
   beside it), each deliverable `data-wheel-deliverable` (ticked by
   the wheel's course: a pending one is grey with an empty circle). Held, the wheel marks the current phase
   `data-wheel-active`. Phones and reduced motion read every phase complete. */
export function WheelStep({ phase, backdrop, className }: WheelStepProps) {
  return (
    <li data-slot="wheel-step" className={cn(stepVariants(), className)}>
      <GridArea
        columns={{ md: { start: 2, span: 3 }, lg: { start: 3, span: 4 } }}
        align="center"
        overflow="visible"
      >
        <WheelCopy phase={phase} />
      </GridArea>
      <GridArea
        columns={{ md: { start: 5, span: 4 }, lg: { start: 8, span: 5 } }}
        overflow="visible"
        className="relative"
      >
        <span
          lang="ja"
          aria-hidden="true"
          className="pointer-events-none absolute agents-wheel-kanji -z-10 hidden font-mincho font-medium text-agents-line select-none md:block"
        >
          {phase.kanji}
        </span>
        <div className="agents-wheel-panel relative h-full">
          <PhotoStage
            padding="sm"
            width="narrow"
            backdrop={backdrop}
            className="h-full content-center"
          >
            {phase.panel}
          </PhotoStage>
        </div>
      </GridArea>
    </li>
  );
}
