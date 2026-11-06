import { Eyebrow } from "@repo/ui/agents/eyebrow";
import { FaqItem } from "@repo/ui/agents/faq-item";
import { Headline } from "@repo/ui/agents/headline";
import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";

import { objections } from "../shunpo/content";

export function QuestionsSection() {
  return (
    <Section id="questions" spacing="lg">
      <Container size="wide">
        <Grid columns="2" from="lg" gap="3xl" align="start">
          <Stack gap="lg">
            <Eyebrow tone="ink">Questions</Eyebrow>
            <Headline level={2} size="title">
              Ce qu’on nous demande avant de commencer.
            </Headline>
          </Stack>
          <div>
            {objections.map((objection) => (
              <FaqItem key={objection.id} question={objection.question} answer={objection.answer} />
            ))}
          </div>
        </Grid>
      </Container>
    </Section>
  );
}
