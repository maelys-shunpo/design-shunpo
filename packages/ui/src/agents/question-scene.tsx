"use client";

import { type ReactElement, useCallback, useRef } from "react";

import { Shuriken } from "../brand/shuriken.tsx";
import { Container } from "../layout/container.tsx";
import { NIGHT_ENTER_SCREENS, questionHold } from "../motion/question-geometry.ts";
import { ScrollScene } from "../motion/scroll-scene.tsx";
import { questionCourse } from "./question-course.ts";
import { QuestionNight, type QuestionPlates } from "./question-night.tsx";
import { StatementLines } from "./statement-lines.tsx";

interface QuestionSceneProps {
  /* The question (h2) asked in the night. */
  question: ReactElement;
  /* What lies behind the question: four plates in a row under it. */
  plates: QuestionPlates;
  /* The answer on the paper beneath, as paragraphs of lines; large brackets land around the last one. */
  answer: ReadonlyArray<readonly string[]>;
  /* The word the answer is about, in its last paragraph: set between ink brackets, as in the method's title. */
  answerKeyword?: string | undefined;
  /* The answer's heading level, one below the question's. */
  answerLevel?: "h3" | undefined;
  /* How the night arrives. `card` (default): it opens as a card around the question on the paper below and grows to
     the screen. `full`: it is already the whole screen as the scene pins, for a scene that rises over a held hero
     that has set into the same night, with no card and no half-screen of entrance. */
  arrival?: "card" | "full" | undefined;
}

/* A question asked in the night, then answered on paper. Held on screen for as long as its course runs (about three and
   a third screens for a three-line answer): Fuji Night arrives as a card around the question and grows to the
   screen (or is already the whole screen when `arrival` is `full`, for a scene that rises over a hero set into the same
   night), the question rises from the middle to the top and the plates rise into a row under it one after the other
   and rest there to be read, then the SHUNPO shuriken cuts the night away (it turns 135° and grows until no night is left) and the answer's lines rise on
   the paper beneath. One two-corner frame jumps from plate to plate as each arrives and lets go once the last has landed; as the
   answer lands, its keyword comes into focus and its ink brackets close on it, as in the method's title.
   Reduced motion: the question and its plates on a Fuji Night band, then the answer under the shuriken. */
export function QuestionScene({
  question,
  plates,
  answer,
  answerKeyword,
  answerLevel,
  arrival = "card",
}: QuestionSceneProps) {
  const stage = useRef<HTMLDivElement>(null);
  /* A full-screen arrival drops the night's entrance: the night is already the whole screen as the scene pins. */
  const nightEnter = arrival === "full" ? 0 : NIGHT_ENTER_SCREENS;
  /* Held exactly as long as the course runs: the night's entrance, the plates, the cut and the answer's reading. */
  const hold = questionHold(
    answer.reduce((lines, paragraph) => lines + paragraph.length, 0),
    nightEnter,
  );
  const walk = useCallback(
    (timeline: gsap.core.Timeline) => {
      const paint = stage.current === null ? undefined : questionCourse(stage.current, nightEnter);
      if (paint === undefined) {
        return;
      }
      const course = { held: 0 };
      paint(0);
      timeline.to(course, {
        held: hold,
        ease: "none",
        duration: 1,
        onUpdate: () => {
          paint(course.held);
        },
      });
    },
    [hold, nightEnter],
  );
  return (
    <ScrollScene choreography={walk} length={hold}>
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
              <StatementLines
                paragraphs={answer}
                keyword={answerKeyword}
                as={answerLevel ?? "div"}
              />
            </div>
          </Container>
        </div>
      </div>
    </ScrollScene>
  );
}
