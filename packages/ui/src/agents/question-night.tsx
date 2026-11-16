import type { ReactElement } from "react";

import { Container } from "../layout/container.tsx";
import { NightPlate, type PlateIcon } from "./night-plate.tsx";

/* The question on top and its four plates in a row under it, all one width so their titles break alike: stacked on a
   phone, two by two on a tablet, four abreast from `lg`. */
const PLATE_ROW =
  "grid grid-cols-1 gap-y-3 md:grid-cols-2 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 lg:gap-x-10";

export interface QuestionPlate {
  icon: PlateIcon;
  title: string;
  text: string;
}

export type QuestionPlates = readonly [QuestionPlate, QuestionPlate, QuestionPlate, QuestionPlate];

interface QuestionNightProps {
  question: ReactElement;
  plates: QuestionPlates;
}

/* The night of a `QuestionScene`: a Fuji Night island holding the question and, under it, its plates. With motion it
   covers the stage and the scene cuts it away; otherwise it is a band above the answer. */
export function QuestionNight({ question, plates }: QuestionNightProps) {
  return (
    <div
      data-question-night=""
      className="agents-grain bg-background py-24 scheme-dark motion-safe:absolute motion-safe:inset-0 motion-safe:z-10 motion-safe:flex motion-safe:flex-col motion-safe:justify-center motion-safe:py-0"
    >
      <Container size="wide">
        <div data-question-content="" className="flex flex-col gap-8 md:gap-12 lg:gap-16">
          <div data-question-text="" className="text-balance">
            {question}
          </div>
          <div className={PLATE_ROW}>
            {plates.map((plate) => (
              <div key={plate.title} data-question-plate="">
                <NightPlate {...plate} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
