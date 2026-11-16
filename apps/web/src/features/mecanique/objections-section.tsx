import { Container } from "@repo/ui/layout/container";
import { Grid } from "@repo/ui/layout/grid";
import { Section } from "@repo/ui/layout/section";
import { Stack } from "@repo/ui/layout/stack";
import { FaqItem } from "@repo/ui/mecanique/faq-item";

import { objections } from "../shunpo/content";
import { SectionHeading } from "./section-heading";

export function ObjectionsSection() {
  return (
    <Section spacing="xl" aria-labelledby="questions-titre">
      <Container size="wide">
        <Grid columns="2" from="lg" gap="3xl" align="start">
          <SectionHeading
            id="questions-titre"
            label="Notice 06 · Questions"
            title="Avant de démonter quoi que ce soit."
            lead="Les six questions qu’on nous pose le plus souvent, et nos réponses franches."
          />
          <Stack gap="none">
            {objections.map((objection, index) => (
              <FaqItem
                key={objection.id}
                index={String(index + 1).padStart(2, "0")}
                question={objection.question}
                answer={objection.answer}
              />
            ))}
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
