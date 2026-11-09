import { Headline } from "@repo/ui/agents/headline";
import { QuestionScene } from "@repo/ui/agents/question-scene";
import { Section } from "@repo/ui/layout/section";

import { problemAnswer, problemPlates, problemQuestion } from "./problem-content";

/* The friction before the mechanism, as on the home page: the question in the night, the pains around it, the
   shuriken cuts the night away and the answer rises on the paper. */
export function ProblemSection() {
  return (
    <Section id="probleme" spacing="flush" aria-labelledby="probleme-titre">
      <QuestionScene
        question={
          <Headline level={2} size="title" align="center" id="probleme-titre">
            {problemQuestion}
          </Headline>
        }
        plates={problemPlates}
        answer={problemAnswer}
        answerLevel="h3"
      />
    </Section>
  );
}
