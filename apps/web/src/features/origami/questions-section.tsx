import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { FoldQuestion } from "@repo/ui/origami/fold-question";
import { Heading } from "@repo/ui/typography/heading";
import { Text } from "@repo/ui/typography/text";

import { objections } from "@/features/shunpo/content";

export function QuestionsSection() {
  return (
    <Section id="questions" spacing="xl">
      <Container size="wide">
        <Grid columns="2" from="lg" gap="2xl" align="start">
          <Stack gap="md">
            <Heading level={2} size="display">
              Avant le premier pli.
            </Heading>
            <Text size="lg" tone="muted" measure="prose">
              Les questions qu’un dirigeant se pose avant de se lancer, et nos réponses franches.
            </Text>
          </Stack>
          <Stack gap="none">
            {objections.map((objection) => (
              <FoldQuestion key={objection.id} question={objection.question}>
                {objection.answer}
              </FoldQuestion>
            ))}
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
