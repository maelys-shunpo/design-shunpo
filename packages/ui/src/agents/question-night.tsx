import type { ReactElement } from "react";

import { Container } from "../layout/container.tsx";
import { NightPlate } from "./night-plate.tsx";

/* The question in the middle; two plates above it, two below. Stacked and staggered until `lg`, then around it in
   two rows, the upper plates resting on the question, the lower ones hanging from it. */
const QUESTION_SLOT =
  "col-span-12 row-start-3 py-2 text-balance lg:col-span-10 lg:col-start-2 lg:row-start-2 lg:py-0";
const PLATE_SLOTS = [
  "col-span-10 col-start-1 row-start-1 md:col-span-8 lg:col-span-4 lg:col-start-3 lg:self-end",
  "col-span-9 col-start-4 row-start-2 md:col-span-8 md:col-start-5 lg:col-span-4 lg:col-start-8 lg:row-start-1 lg:self-end xl:col-span-3",
  "col-span-9 col-start-1 row-start-4 md:col-span-8 lg:col-span-4 lg:col-start-1 lg:row-start-3 lg:self-start xl:col-span-3 xl:col-start-2",
  "col-span-10 col-start-3 row-start-5 md:col-span-8 md:col-start-5 lg:col-span-4 lg:col-start-8 lg:row-start-3 lg:self-start",
] as const;

export interface QuestionPlate {
  number: string;
  title: string;
  text: string;
}

export type QuestionPlates = readonly [QuestionPlate, QuestionPlate, QuestionPlate, QuestionPlate];

interface QuestionNightProps {
  question: ReactElement;
  plates: QuestionPlates;
}

/* The night of a `QuestionScene`: a Fuji Night island holding the question and its plates. With motion it covers the
   stage and the scene cuts it away; otherwise it is a band above the answer. */
export function QuestionNight({ question, plates }: QuestionNightProps) {
  return (
    <div
      data-question-night=""
      className="bg-background py-24 scheme-dark motion-safe:absolute motion-safe:inset-0 motion-safe:z-10 motion-safe:flex motion-safe:flex-col motion-safe:justify-center motion-safe:py-0"
    >
      <Container size="wide">
        <div
          data-question-content=""
          className="grid grid-cols-12 gap-x-4 gap-y-3 lg:gap-x-10 lg:gap-y-20"
        >
          <div className={QUESTION_SLOT}>{question}</div>
          {plates.map((plate, index) => (
            <div key={plate.number} data-question-plate="" className={PLATE_SLOTS[index]}>
              <NightPlate {...plate} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
