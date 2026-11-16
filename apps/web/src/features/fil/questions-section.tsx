import { FilQuestion } from "@repo/ui/fil/fil-question";
import { FilSection } from "@repo/ui/fil/fil-section";
import { FilTitle } from "@repo/ui/fil/fil-title";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";

import { objections } from "../shunpo/content";

export function QuestionsSection() {
  return (
    <FilSection id="questions" ground="kome" spacing="lg" thread="right">
      <Container>
        <Grid columns="2" from="lg" gap="3xl" align="start">
          <FilTitle level={2} size="display" pinned data-fil-reveal>
            Avant de tirer le premier fil.
          </FilTitle>
          <div>
            {objections.map((objection) => (
              <FilQuestion
                key={objection.id}
                question={objection.question}
                answer={objection.answer}
              />
            ))}
          </div>
        </Grid>
      </Container>
    </FilSection>
  );
}
