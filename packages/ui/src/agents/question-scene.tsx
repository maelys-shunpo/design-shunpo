"use client";

import { type ReactElement, useCallback, useRef } from "react";

import { Shuriken } from "../brand/shuriken.tsx";
import { Container } from "../layout/container.tsx";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { sceneLength } from "../motion/tokens.ts";
import { questionCourse } from "./question-course.ts";
import { QuestionNight, type QuestionPlates } from "./question-night.tsx";
import { StatementLines } from "./statement-lines.tsx";

const HOLD = sceneLength.long;

interface QuestionSceneProps {
  /* The question (h2) asked in the night. */
  question: ReactElement;
  /* What lies behind the question: two plates above it, two below. */
  plates: QuestionPlates;
  /* The answer on the paper beneath, as paragraphs of lines; large brackets land around the last one. */
  answer: ReadonlyArray<readonly string[]>;
  /* The answer's heading level, one below the question's. */
  answerLevel?: "h3" | undefined;
}

/* A question asked in the night, then answered on paper. Held on screen, Fuji Night arrives as a card around the
   question and grows to the screen, the plates arrive around it one after the other, then the SHUNPO shuriken cuts the
   night away (it turns 135° and grows until no night is left) and the answer's lines rise on the paper beneath. One
   two-corner frame jumps from plate to plate as each arrives, lets go during the cut, then lands as large brackets
   around the answer's last line.
   Reduced motion: the question and its plates on a Fuji Night band, then the answer under the shuriken. */
export function QuestionScene({ question, plates, answer, answerLevel }: QuestionSceneProps) {
  const stage = useRef<HTMLDivElement>(null);
  const walk = useCallback((timeline: gsap.core.Timeline) => {
    const paint = stage.current === null ? undefined : questionCourse(stage.current);
    if (paint === undefined) {
      return;
    }
    const course = { held: 0 };
    paint(0);
    timeline.to(course, {
      held: HOLD,
      ease: "none",
      duration: 1,
      onUpdate: () => {
        paint(course.held);
      },
    });
  }, []);
  return (
    <ScrollScene choreography={walk} length="long">
      <div ref={stage} data-slot="question-scene" className="relative w-full motion-safe:h-svh">
        <QuestionNight question={question} plates={plates} />
        {/* The scene's one two-corner frame, placed by the course on what it designates. */}
        <span
          data-question-frame=""
          aria-hidden="true"
          className="agents-frame-travel hidden motion-safe:block"
        />
        <div className="grid place-items-center py-24 motion-safe:absolute motion-safe:inset-0 motion-safe:py-0">
          <Container>
            <div className="flex flex-col items-center gap-8 md:gap-10">
              <Shuriken size="lg" className="motion-safe:hidden" />
              <StatementLines paragraphs={answer} as={answerLevel ?? "div"} />
            </div>
          </Container>
        </div>
      </div>
    </ScrollScene>
  );
}
