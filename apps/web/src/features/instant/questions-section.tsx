import { Question } from "@repo/ui/instant/question";
import { Reveal } from "@repo/ui/instant/reveal";
import { Spread } from "@repo/ui/instant/spread";
import { Container } from "@repo/ui/layout/container";
import { Section } from "@repo/ui/layout/section";

import { objections } from "../shunpo/content";
import { SectionHeading } from "./section-heading";

export function QuestionsSection() {
  return (
    <Section id="questions" spacing="lg">
      <Container size="wide">
        <Spread
          hold
          margin={
            <SectionHeading
              place="margin"
              index="06"
              label="Questions"
              title="Ce qu’on nous demande avant de commencer."
              lead="Des réponses franches, dans vos mots. Le reste se règle au premier échange."
            />
          }
        >
          <Reveal mode="sweep">
            {objections.map((objection) => (
              <Question key={objection.id} question={objection.question}>
                {objection.answer}
              </Question>
            ))}
          </Reveal>
        </Spread>
      </Container>
    </Section>
  );
}
