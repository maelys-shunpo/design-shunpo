import { Headline } from "@repo/ui/agents/headline";
import { QuestionScene } from "@repo/ui/agents/question-scene";
import { Section } from "@repo/ui/layout/section";

import { problemAnswer, problemKeyword, problemPlates, problemQuestion } from "./problem-content";

/* The friction before the mechanism, as on the home page: the night is already the whole screen when the scene pins
   (`arrival="full"`), rising over the hero that has set into the same night, so there is no cream flash at the seam;
   the question rises to the top, the pains rise into a row under it, the shuriken cuts the night away and the answer
   rises on the paper. */
export function ProblemSection() {
  return (
    <Section id="probleme" spacing="flush" aria-labelledby="probleme-titre">
      <QuestionScene
        question={
          <Headline level={2} size="title" align="center" id="probleme-titre" entrance="lines">
            {problemQuestion}
          </Headline>
        }
        plates={problemPlates}
        answer={problemAnswer}
        answerKeyword={problemKeyword}
        answerLevel="h3"
        arrival="full"
      />
    </Section>
  );
}
